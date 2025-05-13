import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '../components/Buttons';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const state = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  const redirectUri = `${window.location.origin}/integrations/github/oauth2/callback`;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo%20user:email&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  const handleGithubLogin = () => {
    setIsLoading(true);
    localStorage.setItem('latestCSRFToken', state);
    window.location.assign(authUrl);
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-extrabold text-xl">Q</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome to QuickDeploy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to start deploying your projects
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Connect with your GitHub account to continue
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGithubLogin}
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <div className="animate-spin">🌀</div>
                  ) : (
                    <Github className="h-5 w-5" />
                  )
                }
                className="w-full"
              >
                {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;