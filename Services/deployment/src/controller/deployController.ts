/* ---------- src/controller/deployController.ts ---------- */

import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import tar from 'tar-fs';
import zlib from 'zlib';
import { glob } from 'glob';
import mime from 'mime-types';
import { execa } from 'execa';
import AWS from 'aws-sdk';
import User from '../models/User';

/* ── AWS init ─────────────────────────────────────────── */
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  maxRetries: 10,
  retryDelayOptions: { base: 1000 },
  httpOptions: {
    timeout: 90_000,
    agent: new (require('https').Agent)({
      keepAlive: true,
      maxSockets: 25,
      rejectUnauthorized: true,
      keepAliveMsecs: 15_000,
    }),
  },
});
const s3 = new AWS.S3();

/* ── helper: wipe the bucket before new deploy ────────── */
async function clearBucket(bucket: string) {
  let ContinuationToken: string | undefined;
  do {
    const listed = await s3
      .listObjectsV2({ Bucket: bucket, ContinuationToken })
      .promise();

    if (!listed.Contents || listed.Contents.length === 0) break;

    const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: listed.Contents.map((o) => ({ Key: o.Key! })) },
    };
    await s3.deleteObjects(deleteParams).promise();
    ContinuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (ContinuationToken);
}

/* ── helper: upload with retries ──────────────────────── */
async function uploadFile(local: string, key: string, bucket: string) {
  const { size } = fsSync.statSync(local);
  const multipart = size > 10 * 1024 * 1024; // >10 MB
  const params = {
    Bucket: bucket,
    Key: key,
    ContentType: mime.lookup(local) || 'application/octet-stream',
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (!multipart) {
        await s3.putObject({ ...params, Body: fsSync.createReadStream(local) }).promise();
      } else {
        await new Promise<void>((res, rej) => {
          s3.upload(
            { ...params, Body: fsSync.createReadStream(local) },
            { partSize: 8 * 1024 * 1024, queueSize: 4 },
          )
            .on('httpUploadProgress', () => {})
            .send((err: AWS.AWSError | undefined) => (err ? rej(err) : res()));
        });
      }
      return;
    } catch (err: any) {
      const retryable =
        ['EPIPE', 'ECONNRESET', 'TimeoutError', 'NetworkingError'].includes(err.code) ||
        /timeout/i.test(err.message);
      if (!retryable || attempt === 3) throw err;
      console.warn(`Retry ${attempt}/3 – ${key}`);
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
}

/* ── Deploy controller ──────────────────────────────── */
export const deployProject = async (req: Request, res: Response) => {
  let tmpDir = '';

  try {
    /* Validate */
    const user = await User.findById(req.user?.id);
    const { repoFullName } = req.body;
    if (!user?.githubToken) throw new Error('Missing GitHub token');
    if (!repoFullName?.includes('/')) throw new Error('Invalid repository name');
    if (!process.env.S3_BUCKET) throw new Error('S3 bucket not configured');

    /* Verify repo */
    await axios.get(`https://api.github.com/repos/${repoFullName}`, {
      headers: { Authorization: `Bearer ${user.githubToken}` },
      timeout: 10000,
    });

    /* Workspace */
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deploy-'));
    const tarPath = path.join(tmpDir, 'repo.tar.gz');

    const tarResp = await axios({
      url: `https://api.github.com/repos/${repoFullName}/tarball`,
      method: 'get',
      responseType: 'stream',
      headers: { Authorization: `Bearer ${user.githubToken}` },
      timeout: 30000,
    });

    await new Promise((ok, err) =>
      tarResp.data.pipe(fsSync.createWriteStream(tarPath)).on('finish', ok).on('error', err),
    );

    /* Extract */
    await new Promise((ok, err) =>
      fsSync
        .createReadStream(tarPath)
        .pipe(zlib.createGunzip())
        .pipe(tar.extract(tmpDir, { strip: 1 }))
        .on('finish', ok)
        .on('error', err),
    );
    await fs.unlink(tarPath);

    /* Optional build */
    let buildDir = tmpDir;
    const pkgJSON = path.join(tmpDir, 'package.json');
    if (fsSync.existsSync(pkgJSON)) {
      const pkg = JSON.parse(await fs.readFile(pkgJSON, 'utf8'));
      if (pkg.scripts?.build) {
        const execOpts = { cwd: tmpDir, stdio: 'inherit' as const, timeout: 5 * 60_000 };
        const hasYarn = fsSync.existsSync(path.join(tmpDir, 'yarn.lock'));
        const hasPNPM = fsSync.existsSync(path.join(tmpDir, 'pnpm-lock.yaml'));
        if (hasYarn) await execa('yarn', ['install'], execOpts);
        else if (hasPNPM) await execa('pnpm', ['install', '--shamefully-hoist'], execOpts);
        else await execa('npm', ['ci'], execOpts);
        await execa('npm', ['run', 'build'], execOpts);

        const outDir = ['build', 'dist', 'out', 'public'].find((d) =>
          fsSync.existsSync(path.join(tmpDir, d)),
        );
        if (!outDir) throw new Error('Build succeeded but no output folder found');
        buildDir = path.join(tmpDir, outDir);
      }
    }

    /* List files */
    const files = await glob('**/*', {
      cwd: buildDir,
      nodir: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/*.tar.gz', '**/*.zip'],
    });
    if (files.length === 0) throw new Error('No deployable files found');

    /* 1️⃣ clear previous deploy */
    await clearBucket(process.env.S3_BUCKET);

    /* 2️⃣ upload new site (concurrent) */
    const MAX_CONCURRENCY = 5;
    const queue: Promise<void>[] = [];
    for (const f of files) {
      const full = path.join(buildDir, f);
      queue.push(uploadFile(full, f, process.env.S3_BUCKET!));
      if (queue.length >= MAX_CONCURRENCY) await Promise.race(queue);
    }
    await Promise.all(queue);

    /* Update stats */
    await User.findByIdAndUpdate(req.user?.id, {
      $inc: { deployments: 1 },
      $set: { lastDeployed: new Date() },
    });

    /* Public URL */
    const url = `https://${process.env.S3_BUCKET}.s3-website-${process.env.AWS_REGION}.amazonaws.com/`;
    res.json({ success: true, url, message: 'Deployment completed successfully' });
  } catch (err: any) {
    console.error('Deployment Error:', err);
    res
      .status(500)
      .json({ success: false, error: err.message || 'Deployment failed' });
  } finally {
    if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
  }
};
