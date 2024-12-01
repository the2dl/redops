import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, LoginCredentials, ApiError } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [azureEnabled, setAzureEnabled] = useState(false);

  useEffect(() => {
    console.log('Authentication state:', isAuthenticated);
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      console.log('Redirecting to:', from);
      navigate(from, { replace: true });
    }

    // Check if Azure AD is enabled
    const checkAzureStatus = async () => {
      try {
        const response = await fetch('/api/auth/azure-status');
        const data = await response.json();
        setAzureEnabled(data.isEnabled);
      } catch (error) {
        console.error('Failed to check Azure status:', error);
      }
    };

    checkAzureStatus();
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authApi.login(credentials);
      console.log('Login response:', response);
      login(response.token, response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.status) {
          case 401:
            setError('Invalid username or password');
            break;
          case 404:
            setError('Account not found');
            break;
          case 429:
            setError('Too many login attempts. Please try again later');
            break;
          case 503:
            setError('Service temporarily unavailable. Please try again later');
            break;
          default:
            setError('Unable to log in. Please try again');
        }
      } else {
        setError('An unexpected error occurred. Please try again');
        console.error('Login failed:', err);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAzureLogin = async () => {
    try {
      await authApi.loginWithAzure();
    } catch (error) {
      setError('Azure AD login failed');
    }
  };

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </div>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            {azureEnabled && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAzureLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign in with Azure AD
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login; 