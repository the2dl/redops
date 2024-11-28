import { Progress } from '@/components/ui/progress';

interface OperationProgressProps {
  progress: number;
}

export function OperationProgress({ progress }: OperationProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}