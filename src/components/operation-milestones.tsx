import { Milestone } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Crosshair,
  KeyRound,
  Shield,
  ArrowUpRight,
  Download,
  Pencil,
} from 'lucide-react';
import { useState } from 'react';

interface OperationMilestonesProps {
  operationId: string;
}

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Network Mapping',
    date: '2024-03-15',
    status: 'completed',
    description: 'Complete network topology mapping and asset discovery',
    findings: 3,
    techniques: ['T1046', 'T1018'],
    phase: 'reconnaissance',
  },
  {
    id: '2',
    title: 'Initial Foothold',
    date: '2024-03-16',
    status: 'completed',
    description: 'Establish initial access through identified vulnerability',
    findings: 2,
    techniques: ['T1190', 'T1133'],
    phase: 'initial-access',
  },
  {
    id: '3',
    title: 'Persistence Mechanism',
    date: '2024-03-17',
    status: 'in-progress',
    description: 'Deploy persistent access mechanisms',
    findings: 1,
    techniques: ['T1505.003'],
    phase: 'persistence',
  },
  {
    id: '4',
    title: 'Privilege Escalation',
    date: '2024-03-18',
    status: 'planned',
    description: 'Escalate privileges on compromised systems',
    findings: 0,
    techniques: ['T1068'],
    phase: 'privilege-escalation',
  },
  {
    id: '5',
    title: 'Data Exfiltration',
    date: '2024-03-19',
    status: 'blocked',
    description: 'Exfiltrate identified sensitive data',
    findings: 0,
    techniques: ['T1048'],
    phase: 'exfiltration',
  },
];

const phaseIcons = {
  'reconnaissance': Crosshair,
  'initial-access': Shield,
  'persistence': KeyRound,
  'privilege-escalation': ArrowUpRight,
  'exfiltration': Download,
};

const statusStyles = {
  'completed': 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300',
  'in-progress': 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'planned': 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  'blocked': 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300',
};

export function OperationMilestones({ operationId }: OperationMilestonesProps) {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editedMilestone, setEditedMilestone] = useState<Milestone | null>(null);

  // Group milestones by phase
  const milestonesByPhase = mockMilestones.reduce((acc, milestone) => {
    if (!acc[milestone.phase]) {
      acc[milestone.phase] = [];
    }
    acc[milestone.phase].push(milestone);
    return acc;
  }, {} as Record<string, Milestone[]>);

  const handleSaveMilestone = (milestoneId: string) => {
    // Here you would typically save to your backend
    console.log('Saving milestone:', editedMilestone);
    setEditingMilestone(null);
    setEditedMilestone(null);
  };

  // Get all phase values for default expansion
  const allPhases = Object.keys(milestonesByPhase);

  return (
    <Accordion 
      type="multiple" 
      className="w-full space-y-4"
      defaultValue={allPhases}
    >
      {Object.entries(milestonesByPhase).map(([phase, milestones]) => {
        const Icon = phaseIcons[phase as keyof typeof phaseIcons];
        const completedCount = milestones.filter(m => m.status === 'completed').length;

        return (
          <AccordionItem
            key={phase}
            value={phase}
            className="border rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4 w-full">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold capitalize flex-1 text-left">
                  {phase.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {completedCount}/{milestones.length} Complete
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {milestones.map((milestone) => (
                  <Card
                    key={milestone.id}
                    className={cn('border-l-4', statusStyles[milestone.status])}
                  >
                    <CardContent className="p-4">
                      {editingMilestone === milestone.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editedMilestone?.title}
                            onChange={(e) => setEditedMilestone(prev => prev ? {
                              ...prev,
                              title: e.target.value
                            } : null)}
                            placeholder="Milestone title"
                          />
                          <Textarea
                            value={editedMilestone?.description}
                            onChange={(e) => setEditedMilestone(prev => prev ? {
                              ...prev,
                              description: e.target.value
                            } : null)}
                            placeholder="Description"
                          />
                          <Select
                            value={editedMilestone?.status}
                            onValueChange={(value: 'completed' | 'in-progress' | 'planned' | 'blocked') => 
                              setEditedMilestone(prev => prev ? {
                                ...prev,
                                status: value
                              } : null)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingMilestone(null);
                                setEditedMilestone(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveMilestone(milestone.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <Badge variant="secondary" className="capitalize">
                                {milestone.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {milestone.description}
                            </p>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">
                                  Findings:
                                </span>
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
                          <div className="flex items-center gap-2">
                            <time className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(milestone.date).toLocaleDateString()}
                            </time>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingMilestone(milestone.id);
                                setEditedMilestone({ ...milestone });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}