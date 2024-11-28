import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, CalendarIcon, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  timestamp: z.date({
    required_error: "Please select a date and time",
  }),
  command: z.string().min(1, 'Command is required'),
  output: z.string().min(1, 'Output is required'),
  status: z.enum(['success', 'failure', 'detected']),
  mitreTechniques: z.string().min(1, 'At least one MITRE technique is required'),
  isMilestone: z.boolean().default(false),
  milestoneTitle: z.string().optional(),
  milestoneDescription: z.string().optional(),
  phase: z.enum(['reconnaissance', 'initial-access', 'persistence', 'privilege-escalation', 'exfiltration']).optional(),
  isFinding: z.boolean().default(false),
  findingSeverity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  findingTitle: z.string().optional(),
  findingDescription: z.string().optional(),
  impactedEntities: z.array(z.object({
    type: z.enum(['ip', 'hostname', 'username', 'service', 'filename', 'hash', 'other']),
    value: z.string().min(1, 'Entity value is required'),
  })).default([]),
}).refine((data) => {
  if (data.isMilestone) {
    return data.milestoneTitle && data.phase;
  }
  return true;
}, {
  message: "Milestone title and phase are required when creating a milestone",
  path: ["milestoneTitle"],
}).refine((data) => {
  if (data.isFinding) {
    return data.findingSeverity && data.findingTitle && data.findingDescription;
  }
  return true;
}, {
  message: "Finding details are required when marking as a finding",
  path: ["findingTitle"],
});

const mockMitreTechniques = [
  'T1046', 'T1190', 'T1133', 'T1505.003', 'T1068', 'T1048',
  'T1557.001', 'T1110.001',
];

export function AddCommandDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timestamp: new Date(),
      command: '',
      output: '',
      status: 'success',
      mitreTechniques: '',
      isMilestone: false,
      isFinding: false,
      impactedEntities: [],
    },
  });

  const isMilestone = form.watch('isMilestone');
  const isFinding = form.watch('isFinding');

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Command
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Command Log Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="isMilestone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as milestone</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFinding"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as finding</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {isMilestone && (
              <div className="space-y-4 border-l-2 pl-4 ml-2">
                <FormField
                  control={form.control}
                  name="milestoneTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milestone Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter milestone title..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="milestoneDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the milestone..."
                          className="h-20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phase</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reconnaissance">Reconnaissance</SelectItem>
                          <SelectItem value="initial-access">Initial Access</SelectItem>
                          <SelectItem value="persistence">Persistence</SelectItem>
                          <SelectItem value="privilege-escalation">Privilege Escalation</SelectItem>
                          <SelectItem value="exfiltration">Exfiltration</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isFinding && (
              <div className="space-y-4 border-l-2 pl-4 ml-2">
                <FormField
                  control={form.control}
                  name="findingTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finding Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter finding title..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="findingDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finding Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the finding..."
                          className="h-20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="findingSeverity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="timestamp"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Timestamp</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP HH:mm:ss")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          step="1"
                          value={format(field.value || new Date(), "HH:mm:ss")}
                          onChange={(e) => {
                            const [hours, minutes, seconds] = e.target.value.split(':');
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            newDate.setSeconds(parseInt(seconds) || 0);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="command"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Command</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter command..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="output"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Command output..."
                      className="h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="detected">Detected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mitreTechniques"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MITRE ATT&CK Techniques</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockMitreTechniques.map((technique) => (
                        <SelectItem key={technique} value={technique}>
                          {technique}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Impacted Entities</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentEntities = form.getValues('impactedEntities') || [];
                    form.setValue('impactedEntities', [
                      ...currentEntities,
                      { type: 'ip', value: '' },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entity
                </Button>
              </div>
              
              {(form.watch('impactedEntities') || []).map((_, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`impactedEntities.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-shrink-0 w-[120px]">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                          </FormControl>
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
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`impactedEntities.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input {...field} placeholder="Entity value" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const currentEntities = form.getValues('impactedEntities');
                      form.setValue(
                        'impactedEntities',
                        currentEntities.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Entry</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}