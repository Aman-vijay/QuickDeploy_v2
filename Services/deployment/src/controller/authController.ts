/* ---------- controller/authController.ts ---------- */
import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import jwt from 'jsonwebtoken';
import qs from 'querystring';            // NEW
import User from '../models/User';

interface AuthResponse {
  token: string;
  message: string;
}

export const handleGitHubCallback = async (req: Request, res: Response) => {
  const { code, state } = req.body;      // state forwarded from the front‑end

  try {
    /* 1️⃣ Exchange code → GitHub access token */
    const params = qs.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.FRONTEND_URL}/integrations/github/oauth2/callback`,
      state,                              // optional but recommended
    });

    const tokenResp = await axios.post<{ access_token: string }>(
      'https://github.com/login/oauth/access_token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResp.data.access_token;
    if (!accessToken) throw new Error('No access token received');

    /* 2️⃣ Fetch GitHub profile + e‑mail */
    const [userResp, emailsResp] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const primaryEmail = emailsResp.data.find(
      (e: any) => e.primary && e.verified
    )?.email;

    /* 3️⃣ Upsert user in MongoDB */
    let user = await User.findOne({ githubId: userResp.data.id });
    if (!user) {
      user = new User({
        githubId: userResp.data.id,
        username: userResp.data.login,
        email: primaryEmail,
        avatarUrl: userResp.data.avatar_url,
        githubToken: accessToken,
      });
    } else {
      user.githubToken = accessToken;
      if (!user.email && primaryEmail) user.email = primaryEmail;
    }
    await user.save();

    /* 4️⃣ Send JWT back */
    const token = jwt.sign(
      { id: user.id, githubId: user.githubId, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    const e = error as AxiosError;
    console.error('GitHub callback error:', e.message);
    if (e.response?.status === 401) {
      return res
        .status(401)
        .json({ error: 'GitHub authentication failed', details: 'Invalid or expired credentials' });
    }
    res.status(500).json({ error: 'Authentication failed', details: e.message });
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: e.message });
  }
};
// Add this controller method
export const getGitHubRepos = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user?.githubToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${user.githubToken}` }
    });

    res.status(200).json({ repos: reposResponse.data });
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};