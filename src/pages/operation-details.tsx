import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OperationMilestones } from '@/components/operation-milestones';
import { CommandLog } from '@/components/command-log';
import { OperationPlan } from '@/components/operation-plan';
import { OperationSummary } from '@/components/operation-summary';
import { operations } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Eye, Target, Waypoints, Users, UserPlus, UserMinus, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/stats-card';
import { OperationProgress } from '@/components/operation-progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@/components/ui/dialog";
import { useState } from 'react';
import { OperationMitreMapping } from '@/components/operation-mitre-mapping';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';

const statusColors = {
  ongoing: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  completed: 'bg-green-500/15 text-green-700 dark:text-green-300',
  planned: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function OperationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const operation = operations.find((op) => op.id === id);
  const [closureNotes, setClosureNotes] = useState("");
  const [isClosing, setIsClosing] = useState(false);

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
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Users className="h-4 w-4" />
                {operation.team?.length ? (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {operation.team.length}
                  </span>
                ) : null}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Team Management</DialogTitle>
                <DialogDescription>
                  Manage operators assigned to this operation.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Current Team</h4>
                  <div className="space-y-2">
                    {operation.team?.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        {operation.status !== 'completed' && operation.status !== 'cancelled' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:text-destructive"
                            onClick={() => {
                              // Handle removing member
                              console.log('Remove member:', member.id);
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {!operation.team?.length && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No team members assigned
                      </p>
                    )}
                  </div>
                </div>

                {operation.status !== 'completed' && operation.status !== 'cancelled' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Add Member</h4>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="op1">Operator 1</SelectItem>
                          <SelectItem value="op2">Operator 2</SelectItem>
                          {/* Add your operators list here */}
                        </SelectContent>
                      </Select>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {operation.status !== 'completed' && operation.status !== 'cancelled' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Close Operation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Close Operation</DialogTitle>
                  <DialogDescription>
                    Please provide closure details for this operation. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Operation Status
                    </label>
                    <Select
                      value={isClosing ? "completed" : "cancelled"}
                      onValueChange={(value) => setIsClosing(value === "completed")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed Successfully</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Closure Notes
                    </label>
                    <Textarea
                      placeholder="Provide details about the operation closure..."
                      value={closureNotes}
                      onChange={(e) => setClosureNotes(e.target.value)}
                      className="h-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Final Success Rate
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter success rate %"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      // Handle operation closure logic here
                      console.log("Operation closed", {
                        status: isClosing ? "completed" : "cancelled",
                        notes: closureNotes
                      });
                    }}
                  >
                    Close Operation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Sheet>
          <SheetTrigger asChild>
            <div className="cursor-pointer">
              <StatsCard
                title="Critical Findings"
                value={operation.criticalFindings?.length || 0}
                icon={<AlertCircle className="h-4 w-4 text-red-500" />}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Critical Findings</SheetTitle>
              <SheetDescription>
                List of all critical findings in this operation
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-4">
                {operation.criticalFindings?.map((finding, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{finding.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {finding.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(finding.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <Badge variant="outline">{finding.severity}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!operation.criticalFindings?.length && (
                  <p className="text-center text-muted-foreground">
                    No critical findings recorded
                  </p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <div className="cursor-pointer">
              <StatsCard
                title="Detections"
                value={operation.detections?.length || 0}
                icon={<Eye className="h-4 w-4 text-yellow-500" />}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Detections</SheetTitle>
              <SheetDescription>
                List of all detections in this operation
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-4">
                {operation.detections?.map((detection, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <Eye className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{detection.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {detection.details}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(detection.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <Badge variant="outline">{detection.type}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!operation.detections?.length && (
                  <p className="text-center text-muted-foreground">
                    No detections recorded
                  </p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <div className="cursor-pointer">
              <StatsCard
                title="MITRE Techniques"
                value={operation.techniques?.length || 0}
                icon={<Target className="h-4 w-4 text-blue-500" />}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>MITRE Techniques</SheetTitle>
              <SheetDescription>
                List of all MITRE ATT&CK techniques used in this operation
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-4">
                {operation.techniques?.map((technique, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <Target className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{technique.name}</p>
                            <Badge variant="outline" className="font-mono">
                              {technique.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {technique.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{technique.tactic}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!operation.techniques?.length && (
                  <p className="text-center text-muted-foreground">
                    No MITRE techniques recorded
                  </p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <div className="cursor-pointer">
              <StatsCard
                title="Success Rate"
                value={`${operation.successRate || 0}%`}
                icon={<Waypoints className="h-4 w-4 text-green-500" />}
              />
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Success Metrics</SheetTitle>
              <SheetDescription>
                Detailed breakdown of operation success metrics
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-4">
                {/* Add your success metrics details here */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Overall Success Rate</h4>
                        <div className="text-3xl font-bold text-green-500">
                          {operation.successRate || 0}%
                        </div>
                      </div>
                      {/* Add more success metrics as needed */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
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
          <TabsTrigger value="mitre">MITRE Mapping</TabsTrigger>
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
        <TabsContent value="mitre" className="space-y-4">
          <OperationMitreMapping operationId={operation.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}