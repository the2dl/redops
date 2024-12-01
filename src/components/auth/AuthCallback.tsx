import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await authApi.handleAuthCallback(token);
        login(response.token, response.user);
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback failed:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return <div>Completing sign in...</div>;
}; 