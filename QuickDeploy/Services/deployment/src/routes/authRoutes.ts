import { Router, RequestHandler } from 'express';
import { handleGitHubCallback, getUserInfo, getGitHubRepos } from '../controller/authController';
import { deployProject } from '../controller/deployController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/github/callback', handleGitHubCallback as RequestHandler);
router.get('/me', authenticateToken as RequestHandler, getUserInfo as RequestHandler);
router.get('/github/repos', authenticateToken as RequestHandler, getGitHubRepos as RequestHandler);
router.post('/deploy', authenticateToken as RequestHandler, deployProject as RequestHandler);

export default router;