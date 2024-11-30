import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AdminUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SetupWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [adminUser, setAdminUser] = useState<AdminUser>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (adminUser.password !== adminUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUser.username,
          email: adminUser.email,
          password: adminUser.password
        })
      });

      const data = await response.json();
      console.log('Setup response:', data);

      if (response.ok && data.token && data.user) {
        const user = {
          id: data.user.id,
          username: data.user.username,
          isAdmin: data.user.isAdmin
        };
        
        login(data.token, user);
        
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        setError(data.error || 'Setup failed: Invalid response data');
        console.error('Setup response data:', data);
      }
    } catch (error) {
      setError('Setup failed: Network error');
      console.error('Setup failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Welcome to redops!
            </CardTitle>
            <CardDescription className="text-center">
              Let's set up your admin account to get started
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

            <div className="flex justify-between mb-8">
              <div 
                className={`flex-1 text-center pb-2 border-b-2 transition-colors ${
                  step === 1 ? 'border-primary text-primary' : 'border-muted text-muted-foreground'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step === 1 ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    1
                  </div>
                  Admin Account
                </div>
              </div>
              <div 
                className={`flex-1 text-center pb-2 border-b-2 transition-colors ${
                  step === 2 ? 'border-primary text-primary' : 'border-muted text-muted-foreground'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step === 2 ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    2
                  </div>
                  Configuration
                </div>
              </div>
            </div>

            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Enter admin username"
                    value={adminUser.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter admin email"
                    value={adminUser.email}
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
                    placeholder="Create a secure password"
                    value={adminUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={adminUser.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Create Admin Account
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="text-sm text-muted-foreground text-center">
            This is a one-time setup process to configure redops
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SetupWizard; 