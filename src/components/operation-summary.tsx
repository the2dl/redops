import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface OperationSummaryProps {
  operationId: string;
}

export function OperationSummary({ operationId }: OperationSummaryProps) {
  const handleGenerateSummary = () => {
    // This would typically trigger the LLM summary generation
    console.log('Generating summary for operation:', operationId);
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 py-6">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-center">
              Generate an AI-powered summary of this operation
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              The summary will include key findings, statistics, and recommendations based on the operation's data.
            </p>
            <Button 
              size="lg"
              className="mt-4"
              onClick={handleGenerateSummary}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}