/* ---------- src/pages/GitHubCallback.tsx ---------- */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';

interface AuthResponse {
  token: string;
  message: string;
}

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = localStorage.getItem('latestCSRFToken');

    if (!code || !state || state !== storedState) {
      navigate('/login');
      return;
    }

    /* async helper kept inside but NOT returned */
    const exchangeCodeForToken = async () => {
      try {
        const payload = { code, state };              // include state
        const res = await axios.post<AuthResponse>(
          'http://localhost:8000/api/auth/github/callback',
          payload,
          { withCredentials: true }
        );

        localStorage.setItem('token', res.data.token);
        localStorage.removeItem('latestCSRFToken');
        window.dispatchEvent(new Event('authStateChange'));
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    exchangeCodeForToken();   // call but don't await / return
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Processing GitHub login…</p>
    </div>
  );
};

export default GitHubCallback;
