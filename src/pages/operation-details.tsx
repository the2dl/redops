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

const statusColors = {
  ongoing: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  completed: 'bg-green-500/15 text-green-700 dark:text-green-300',
  planned: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function OperationDetails() {
  const { id } = useParams();
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