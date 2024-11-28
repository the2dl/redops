import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OperationMilestones } from '@/components/operation-milestones';
import { CommandLog } from '@/components/command-log';
import { OperationPlan } from '@/components/operation-plan';
import { OperationSummary } from '@/components/operation-summary';
import { operations } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Eye, Target, Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/stats-card';
import { OperationProgress } from '@/components/operation-progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const statusColors = {
  ongoing: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  completed: 'bg-green-500/15 text-green-700 dark:text-green-300',
  planned: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function OperationDetails() {
  const { id } = useParams();
  const operation = operations.find((op) => op.id === id);

  if (!operation) {
    return <div>Operation not found</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{operation.name}</h1>
            <Badge variant="secondary" className={statusColors[operation.status]}>
              {operation.status}
            </Badge>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Critical Findings"
          value={operation.criticalFindings || 0}
          icon={<AlertCircle className="h-4 w-4 text-red-500" />}
        />
        <StatsCard
          title="Detections"
          value={operation.detections || 0}
          icon={<Eye className="h-4 w-4 text-yellow-500" />}
        />
        <StatsCard
          title="MITRE Techniques"
          value={operation.techniques || 0}
          icon={<Target className="h-4 w-4 text-blue-500" />}
        />
        <StatsCard
          title="Success Rate"
          value={`${operation.successRate || 0}%`}
          icon={<Waypoints className="h-4 w-4 text-green-500" />}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Target</h3>
              <p className="font-medium">{operation.target}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
              <p className="font-medium">
                {new Date(operation.startDate).toLocaleDateString()} 
                {operation.endDate && ` - ${new Date(operation.endDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <OperationProgress progress={operation.progress || 0} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="plan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="commands">Command Log</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="space-y-4">
          <OperationPlan operationId={operation.id} />
        </TabsContent>
        <TabsContent value="milestones" className="space-y-4">
          <OperationMilestones operationId={operation.id} />
        </TabsContent>
        <TabsContent value="commands" className="space-y-4">
          <CommandLog operationId={operation.id} />
        </TabsContent>
        <TabsContent value="summary" className="space-y-4">
          <OperationSummary operationId={operation.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}