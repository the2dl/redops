import { Card } from '@/components/ui/card';
import { TimelineEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TimelineProps {
  operationId: string;
}

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2024-03-15T09:00:00',
    title: 'Operation Started',
    description: 'Initial reconnaissance phase began',
    type: 'info',
  },
  {
    id: '2',
    date: '2024-03-15T11:30:00',
    title: 'Network Access Achieved',
    description: 'Successfully established foothold in target network',
    type: 'success',
  },
  {
    id: '3',
    date: '2024-03-15T14:15:00',
    title: 'Detection Alert',
    description: 'Possible IDS trigger on subnet 192.168.1.0/24',
    type: 'warning',
  },
  {
    id: '4',
    date: '2024-03-15T16:45:00',
    title: 'Critical Finding',
    description: 'Discovered unpatched vulnerability in main application server',
    type: 'error',
  },
];

const typeStyles = {
  info: 'border-blue-500/50 dark:border-blue-500/30 bg-blue-500/10',
  success: 'border-green-500/50 dark:border-green-500/30 bg-green-500/10',
  warning: 'border-yellow-500/50 dark:border-yellow-500/30 bg-yellow-500/10',
  error: 'border-red-500/50 dark:border-red-500/30 bg-red-500/10',
};

export function Timeline({ operationId }: TimelineProps) {
  return (
    <div className="space-y-8">
      {mockTimelineEvents.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            {index !== mockTimelineEvents.length - 1 && (
              <div className="w-0.5 h-full bg-border" />
            )}
          </div>
          <Card
            className={cn(
              'flex-1 p-4 border-l-4',
              typeStyles[event.type]
            )}
          >
            <div className="text-sm text-muted-foreground">
              {new Date(event.date).toLocaleString()}
            </div>
            <h3 className="font-semibold mt-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          </Card>
        </div>
      ))}
    </div>
  );
}