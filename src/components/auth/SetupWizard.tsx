import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface AdminUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AzureConfig {
  clientId: string;
  tenantId: string;
  clientSecret: string;
  redirectUri: string;
  isEnabled: boolean;
}

const AzureSetupHelp: React.FC = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Azure AD Setup Help</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Azure AD Setup Guide</DialogTitle>
        <DialogDescription>
          Follow these steps to configure Azure AD authentication:
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <ol className="list-decimal list-inside space-y-3">
          <li>Go to Azure Portal &gt; Azure AD &gt; Enterprise Applications</li>
          <li>Click "Create new" and select "Register an application"</li>
          <li>Name your application (e.g., "redops")</li>
          <li>Configure the redirect URL:
            <div className="mt-2 p-2 bg-muted rounded-md font-mono text-sm">
              {`${import.meta.env.VITE_API_URL}/auth/azure/callback`}
            </div>
          </li>
          <li>After creation, collect these values from the Overview page:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Application (client) ID</li>
              <li>Directory (tenant) ID</li>
            </ul>
          </li>
          <li>Generate a client secret:
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Go to "Certificates & secrets"</li>
              <li>Create "New client secret"</li>
              <li>Copy the secret value immediately (it won't be shown again)</li>
            </ul>
          </li>
        </ol>
      </div>
      <div className="bg-muted p-4 rounded-md mt-4">
        <p className="text-sm font-medium">Important Notes:</p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li>Store your client secret securely - it cannot be retrieved later</li>
          <li>Update the redirect URL if your API endpoint changes</li>
          <li>Ensure your Azure AD tenant allows the application access</li>
        </ul>
      </div>
    </DialogContent>
  </Dialog>
);

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
  const [azureConfig, setAzureConfig] = useState<AzureConfig>({
    clientId: '',
    tenantId: '',
    clientSecret: '',
    redirectUri: `${import.meta.env.VITE_API_URL}/auth/azure/callback`,
    isEnabled: false
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      if (adminUser.password !== adminUser.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setStep(2);
      return;
    }

    // Final submission (step 2)
    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin: {
            username: adminUser.username,
            email: adminUser.email,
            password: adminUser.password
          },
          azure: azureConfig
        })
      });

      const data = await response.json();
      
      if (response.ok && data.token && data.user) {
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
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
              {step === 1 ? "Let's set up your admin account" : "Configure authentication options"}
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
                  Authentication
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
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
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-center justify-between space-x-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="azure-enabled">Enable Azure AD Authentication</Label>
                      <AzureSetupHelp />
                    </div>
                    <Switch
                      id="azure-enabled"
                      checked={azureConfig.isEnabled}
                      onCheckedChange={(checked) => 
                        setAzureConfig(prev => ({ ...prev, isEnabled: checked }))
                      }
                    />
                  </div>

                  {azureConfig.isEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                          id="clientId"
                          name="clientId"
                          value={azureConfig.clientId}
                          onChange={(e) => setAzureConfig(prev => ({
                            ...prev,
                            clientId: e.target.value
                          }))}
                          required={azureConfig.isEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenantId">Tenant ID</Label>
                        <Input
                          id="tenantId"
                          name="tenantId"
                          value={azureConfig.tenantId}
                          onChange={(e) => setAzureConfig(prev => ({
                            ...prev,
                            tenantId: e.target.value
                          }))}
                          required={azureConfig.isEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          name="clientSecret"
                          value={azureConfig.clientSecret}
                          onChange={(e) => setAzureConfig(prev => ({
                            ...prev,
                            clientSecret: e.target.value
                          }))}
                          required={azureConfig.isEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="redirectUri">Redirect URI</Label>
                        <Input
                          id="redirectUri"
                          name="redirectUri"
                          value={azureConfig.redirectUri}
                          readOnly
                          disabled
                        />
                        <p className="text-sm text-muted-foreground">
                          Use this URL in your Azure AD app registration
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <Button type="submit" className="w-full">
                {step === 1 ? 'Next' : 'Complete Setup'}
              </Button>

              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              )}
            </form>
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