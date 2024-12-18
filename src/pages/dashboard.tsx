import { useAuth } from '@/contexts/AuthContext';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Flag,
  LogOut,
} from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import { OperationsList } from '@/components/operations-list';
import { operations, dashboardStats } from '@/lib/mock-data';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { CreateOperationForm } from '@/components/create-operation-form';
import { CreateAIOperationForm } from '@/components/create-ai-operation-form';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Red Team Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}</p>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <CreateOperationForm />
          <CreateAIOperationForm />
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Operations"
          value={dashboardStats.totalOperations}
          icon={<Flag className="h-4 w-4 text-zinc-500" />}
        />
        <StatsCard
          title="Active Operations"
          value={dashboardStats.activeOperations}
          icon={<Activity className="h-4 w-4 text-blue-500" />}
        />
        <StatsCard
          title="Success Rate"
          value={`${dashboardStats.averageSuccessRate}%`}
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
        />
        <StatsCard
          title="Total Findings"
          value={dashboardStats.totalFindings}
          icon={<AlertCircle className="h-4 w-4 text-red-500" />}
        />
      </div>

      <OperationsList
        title="Operations"
        operations={operations}
      />
    </div>
  );
}