import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Plan } from '@/lib/types';
import { mockPlan } from '@/lib/mock-data';

export function CreateOperationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [objective, setObjective] = useState('');
  const [scope, setScope] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const newOperationId = uuidv4();
    const newPlan: Plan = {
      ...mockPlan,
      id: newOperationId,
      objective,
      scope,
    };
    // In a real app, you would save newPlan to your backend here
    console.log('Creating new operation:', newPlan);
    setIsOpen(false);
    navigate(`/operations/${newOperationId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Operation
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Create New Operation</DialogTitle>
          <DialogDescription>
            Set the objective and scope for your new operation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="objective"
              className="block text-sm font-medium leading-6 text-foreground"
            >
              Objective
            </label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Enter the operation objective"
              className="bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="scope"
              className="block text-sm font-medium leading-6 text-foreground"
            >
              Scope
            </label>
            {scope.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newScope = [...scope];
                    newScope[index] = e.target.value;
                    setScope(newScope);
                  }}
                  className="bg-secondary text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setScope(scope.filter((_, i) => i !== index));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setScope([...scope, ''])}
            >
              Add Item
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}