import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    
    if (adminUser.password !== adminUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminUser)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.user) {
          login(data.token, data.user);
          navigate('/');
        } else {
          navigate('/login');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Setup failed');
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
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Initial Setup</h2>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between mb-6">
            <div className={`flex-1 text-center pb-2 border-b-2 ${step === 1 ? 'border-primary' : 'border-muted'}`}>
              1. Admin Account
            </div>
            <div className={`flex-1 text-center pb-2 border-b-2 ${step === 2 ? 'border-primary' : 'border-muted'}`}>
              2. Configuration
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={adminUser.username}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={adminUser.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={adminUser.password}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
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
      </Card>
    </div>
  );
};

export default SetupWizard; 