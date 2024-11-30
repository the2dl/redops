import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { OperationDetails } from './pages/operation-details';
import { ThemeProvider } from '@/components/theme-provider';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SetupWizard from './components/auth/SetupWizard';
import { useAuth } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
import { authApi, ApiError } from '@/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    authApi.checkSetup()
      .then(data => {
        setSetupRequired(data.setupRequired);
      })
      .catch((err) => {
        console.error('Failed to check setup status:', err);
        setError(err instanceof ApiError ? err.message : 'Failed to connect to server');
        setSetupRequired(true);
      });
  }, []);

  // Show loading state while checking setup status
  if (setupRequired === null) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="red-team-theme">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Register />
            } 
          />
          
          {/* Setup wizard route */}
          {setupRequired && (
            <Route path="/setup" element={<SetupWizard />} />
          )}

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operations/:id" 
            element={
              <ProtectedRoute>
                <OperationDetails />
              </ProtectedRoute>
            } 
          />

          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              setupRequired ? (
                <Navigate to="/setup" replace />
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              setupRequired ? (
                <Navigate to="/setup" replace />
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;