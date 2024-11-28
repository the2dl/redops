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
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { mockPlan } from '@/lib/mock-data';
import { Plan, Task } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OperationPlanProps {
  operationId: string;
}

const statusIcons = {
  'completed': CheckCircle2,
  'in-progress': AlertCircle,
  'planned': Clock,
};

const statusStyles = {
  'completed': 'text-green-500',
  'in-progress': 'text-blue-500',
  'planned': 'text-yellow-500',
};

export function OperationPlan({ operationId }: OperationPlanProps) {
  const [editingObjective, setEditingObjective] = useState(false);
  const [editedObjective, setEditedObjective] = useState(mockPlan.objective);
  const [editingScope, setEditingScope] = useState(false);
  const [editedScope, setEditedScope] = useState([...mockPlan.scope]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [plan, setPlan] = useState<Plan>(mockPlan);
  const [deleteTask, setDeleteTask] = useState<{ phaseIndex: number; taskIndex: number } | null>(null);

  const handleSaveObjective = () => {
    // Here you would typically save to your backend
    console.log('Saving objective:', editedObjective);
    setEditingObjective(false);
  };

  const handleSaveScope = () => {
    console.log('Saving scope:', editedScope);
    setEditingScope(false);
  };

  const handleSaveTask = (phaseIndex: number, taskIndex: number) => {
    console.log('Saving task:', editedTask);
    setEditingTask(null);
    setEditedTask(null);
  };

  const handleAddTask = (phaseIndex: number) => {
    const newTask: Task = {
      title: '',
      description: '',
      status: 'planned',
      techniques: [],
    };
    
    const updatedPlan = { ...plan };
    updatedPlan.phases[phaseIndex].tasks.push(newTask);
    setPlan(updatedPlan);
    
    const newTaskIndex = updatedPlan.phases[phaseIndex].tasks.length - 1;
    setEditingTask(`${phaseIndex}-${newTaskIndex}`);
    setEditedTask(newTask);
  };

  const handleDeleteTask = () => {
    if (!deleteTask) return;

    const { phaseIndex, taskIndex } = deleteTask;
    const updatedPlan = { ...plan };
    updatedPlan.phases[phaseIndex].tasks.splice(taskIndex, 1);
    setPlan(updatedPlan);
    setDeleteTask(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Objective</h3>
                {!editingObjective && (
                  <Button variant="ghost" size="icon" onClick={() => setEditingObjective(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingObjective ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedObjective}
                    onChange={(e) => setEditedObjective(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedObjective(mockPlan.objective);
                        setEditingObjective(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveObjective}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{plan.objective}</p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Scope</h3>
                {!editingScope && (
                  <Button variant="ghost" size="icon" onClick={() => setEditingScope(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingScope ? (
                <div className="space-y-2">
                  {editedScope.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newScope = [...editedScope];
                          newScope[index] = e.target.value;
                          setEditedScope(newScope);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditedScope(editedScope.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setEditedScope([...editedScope, ''])}
                  >
                    Add Item
                  </Button>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedScope([...plan.scope]);
                        setEditingScope(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveScope}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="list-disc list-inside text-muted-foreground">
                  {plan.scope.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {plan.phases.map((phase, phaseIndex) => {
          const Icon = phase.icon;
          return (
            <Card key={phase.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{phase.title}</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTask(phaseIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                <p className="text-muted-foreground mb-6">{phase.description}</p>
                <div className="space-y-4">
                  {phase.tasks.map((task, taskIndex) => {
                    const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
                    const isEditing = editingTask === `${phaseIndex}-${taskIndex}`;

                    return (
                      <Card key={taskIndex} className="border-l-4 border-l-primary">
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 w-full">
                              {isEditing ? (
                                <div className="space-y-4">
                                  <Input
                                    value={editedTask?.title}
                                    onChange={(e) => setEditedTask({
                                      ...editedTask,
                                      title: e.target.value
                                    })}
                                    placeholder="Task title"
                                  />
                                  <Textarea
                                    value={editedTask?.description}
                                    onChange={(e) => setEditedTask({
                                      ...editedTask,
                                      description: e.target.value
                                    })}
                                    placeholder="Task description"
                                  />
                                  <Input
                                    value={editedTask?.command}
                                    onChange={(e) => setEditedTask({
                                      ...editedTask,
                                      command: e.target.value
                                    })}
                                    placeholder="Command (optional)"
                                  />
                                  <Select
                                    value={editedTask?.status}
                                    onValueChange={(value) => setEditedTask({
                                      ...editedTask,
                                      status: value
                                    })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="planned">Planned</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingTask(null);
                                        setEditedTask(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveTask(phaseIndex, taskIndex)}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className={`h-4 w-4 ${statusStyles[task.status]}`} />
                                      <h4 className="font-medium">{task.title}</h4>
                                      <Badge variant="secondary" className="capitalize">
                                        {task.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setEditingTask(`${phaseIndex}-${taskIndex}`);
                                          setEditedTask({ ...task });
                                        }}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteTask({ phaseIndex, taskIndex })}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {task.description}
                                  </p>
                                  {task.command && (
                                    <pre className="mt-2 p-2 bg-muted rounded-md text-sm font-mono">
                                      {task.command}
                                    </pre>
                                  )}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.techniques.map((technique) => (
                                      <Badge
                                        key={technique}
                                        variant="outline"
                                        className="bg-primary/10"
                                      >
                                        {technique}
                                      </Badge>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}