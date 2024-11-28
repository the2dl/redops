import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Milestone } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PhaseGroupProps {
  phase: string;
  milestones: Milestone[];
  icon: LucideIcon;
}

const statusStyles = {
  'completed': 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300',
  'in-progress': 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'planned': 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  'blocked': 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300',
};

export function PhaseGroup({ phase, milestones, icon: Icon }: PhaseGroupProps) {
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold capitalize">{phase.replace('-', ' ')}</h3>
        <Badge variant="secondary" className="ml-auto">
          {completedCount}/{milestones.length} Complete
        </Badge>
      </div>
      
      <div className="space-y-3 relative">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="relative pl-8"
          >
            <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-background bg-muted" style={{ transform: 'translateX(0.25rem)' }} />
            <Card className={cn('border-l-4', statusStyles[milestone.status])}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge variant="secondary" className="capitalize">
                        {milestone.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Findings:</span>
                        <Badge variant="outline">{milestone.findings}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {milestone.techniques.map((technique) => (
                          <Badge
                            key={technique}
                            variant="outline"
                            className="bg-primary/10"
                          >
                            {technique}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <time className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(milestone.date).toLocaleDateString()}
                  </time>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}