import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  count: number;
}

interface OperationMitreMappingProps {
  operationId: string;
}

export function OperationMitreMapping({ operationId }: OperationMitreMappingProps) {
  // This would normally come from your data source
  const tactics = [
    "Reconnaissance",
    "Resource Development",
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Lateral Movement",
    "Collection",
    "Command and Control",
    "Exfiltration",
    "Impact",
  ];

  // Mock data - replace with real data
  const techniques: MitreTechnique[] = [
    {
      id: "T1595",
      name: "Active Scanning",
      tactic: "Reconnaissance",
      description: "Adversaries may execute active reconnaissance scans to gather information.",
      count: 3,
    },
    // Add more techniques as needed
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MITRE ATT&CK® Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TooltipProvider>
              {tactics.map((tactic) => (
                <Card key={tactic} className="border border-border">
                  <CardHeader className="bg-muted/50 py-2">
                    <CardTitle className="text-sm font-medium">{tactic}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {techniques
                        .filter((technique) => technique.tactic === tactic)
                        .map((technique) => (
                          <Tooltip key={technique.id}>
                            <TooltipTrigger>
                              <Badge 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-primary/20"
                              >
                                <span className="font-mono mr-1">{technique.id}</span>
                                <span className="hidden sm:inline">
                                  {technique.name}
                                </span>
                                {technique.count > 1 && (
                                  <span className="ml-1 text-xs bg-primary/20 px-1 rounded-full">
                                    {technique.count}
                                  </span>
                                )}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm">
                              <p className="font-medium">{technique.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {technique.description}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      {techniques.filter((t) => t.tactic === tactic).length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">
                          No techniques detected
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 