import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Command } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Pencil, Plus, X, Sparkles } from 'lucide-react';

interface CommandDetailsProps {
  command: Command | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusStyles = {
  success: 'bg-green-500/15 text-green-700 dark:text-green-300',
  failure: 'bg-red-500/15 text-red-700 dark:text-red-300',
  detected: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
};

const mockMitreTechniques = [
  'T1046', 'T1190', 'T1133', 'T1505.003', 'T1068', 'T1048',
  'T1557.001', 'T1110.001',
];

export function CommandDetails({ command, open, onOpenChange }: CommandDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCommand, setEditedCommand] = useState<Command | null>(null);

  if (!command) return null;

  const handleEdit = () => {
    setEditedCommand(command);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you would typically save the changes to your backend
    console.log('Saving changes:', editedCommand);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCommand(command);
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Command Details</SheetTitle>
          {!isEditing && (
            <Button variant="outline" size="icon" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedCommand ? format(new Date(editedCommand.timestamp), 'PPP HH:mm:ss') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedCommand ? new Date(editedCommand.timestamp) : new Date()}
                      onSelect={(date) => setEditedCommand(prev => prev ? {
                        ...prev,
                        timestamp: date?.toISOString() || prev.timestamp
                      } : null)}
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        step="1"
                        value={format(editedCommand ? new Date(editedCommand.timestamp) : new Date(), 'HH:mm:ss')}
                        onChange={(e) => {
                          if (editedCommand) {
                            const [hours, minutes, seconds] = e.target.value.split(':');
                            const newDate = new Date(editedCommand.timestamp);
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            newDate.setSeconds(parseInt(seconds) || 0);
                            setEditedCommand({
                              ...editedCommand,
                              timestamp: newDate.toISOString()
                            });
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="text-sm">
                  {new Date(command.timestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Command</h3>
              {isEditing ? (
                <Input
                  value={editedCommand?.command}
                  onChange={(e) => setEditedCommand(prev => prev ? {
                    ...prev,
                    command: e.target.value
                  } : null)}
                />
              ) : (
                <pre className="p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                  {command.command}
                </pre>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Output</h3>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedCommand?.output}
                    onChange={(e) => setEditedCommand(prev => prev ? {
                      ...prev,
                      output: e.target.value
                    } : null)}
                    className="min-h-[100px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (editedCommand?.command) {
                        // TODO: Replace with actual AI generation
                        const mockDescription = "This command performs a comprehensive port scan of the target network (192.168.1.0/24) using SYN packets (-sS). It will identify all open ports (-p-) and potential services running on the hosts. This type of scan is commonly used during the reconnaissance phase to map out the network topology and identify potential targets.";
                        setEditedCommand(prev => prev ? {
                          ...prev,
                          output: mockDescription
                        } : null);
                      }
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Description
                  </Button>
                </div>
              ) : (
                <pre className="p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap">
                  {command.output}
                </pre>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              {isEditing ? (
                <Select
                  value={editedCommand?.status}
                  onValueChange={(value: 'success' | 'failure' | 'detected') => 
                    setEditedCommand(prev => prev ? {
                      ...prev,
                      status: value
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="detected">Detected</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className={statusStyles[command.status]}>
                  {command.status}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                MITRE ATT&CK Techniques
              </h3>
              {isEditing ? (
                <Select
                  value={editedCommand?.mitreTechniques[0]}
                  onValueChange={(value) => 
                    setEditedCommand(prev => prev ? {
                      ...prev,
                      mitreTechniques: [value]
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technique" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMitreTechniques.map((technique) => (
                      <SelectItem key={technique} value={technique}>
                        {technique}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {command.mitreTechniques.map((technique) => (
                    <Badge
                      key={technique}
                      variant="outline"
                      className="bg-primary/10"
                    >
                      {technique}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Impacted Entities
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  {editedCommand?.impactedEntities?.map((entity, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={entity.type}
                        onValueChange={(value: 'ip' | 'hostname' | 'username' | 'service' | 'filename' | 'hash' | 'other') => {
                          const newEntities = [...(editedCommand?.impactedEntities || [])];
                          newEntities[index] = { ...entity, type: value };
                          setEditedCommand(prev => prev ? {
                            ...prev,
                            impactedEntities: newEntities
                          } : null);
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ip">IP</SelectItem>
                          <SelectItem value="hostname">Hostname</SelectItem>
                          <SelectItem value="username">Username</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="filename">Filename</SelectItem>
                          <SelectItem value="hash">Hash</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={entity.value}
                        onChange={(e) => {
                          const newEntities = [...(editedCommand?.impactedEntities || [])];
                          newEntities[index] = { ...entity, value: e.target.value };
                          setEditedCommand(prev => prev ? {
                            ...prev,
                            impactedEntities: newEntities
                          } : null);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newEntities = editedCommand?.impactedEntities?.filter((_, i) => i !== index) || [];
                          setEditedCommand(prev => prev ? {
                            ...prev,
                            impactedEntities: newEntities
                          } : null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEntities = [...(editedCommand?.impactedEntities || [])];
                      newEntities.push({ type: 'ip', value: '' });
                      setEditedCommand(prev => prev ? {
                        ...prev,
                        impactedEntities: newEntities
                      } : null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entity
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {command.impactedEntities?.map((entity, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-secondary"
                    >
                      {entity.type}: {entity.value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}