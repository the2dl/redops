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
  const location = useLocation();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        if (isAuthenticated) {
          setSetupRequired(false);
          return;
        }

        if (location.pathname === '/setup') {
          return;
        }

        const response = await fetch('/api/auth/setup-required');
        const data = await response.json();
        setSetupRequired(data.setupRequired);
      } catch (err) {
        console.error('Failed to check setup status:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to server');
      }
    };

    checkSetup();
  }, [location.pathname, isAuthenticated]);

  if (setupRequired === null && !isAuthenticated && location.pathname !== '/setup') {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="red-team-theme">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Routes>
          <Route 
            path="/setup" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SetupWizard />
              )
            } 
          />

          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          } />
          <Route path="/register" element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : setupRequired ? (
                <Navigate to="/setup" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : setupRequired ? (
                <Navigate to="/setup" replace />
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