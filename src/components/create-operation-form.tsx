import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { operationsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export function CreateOperationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    status: 'planned' as const,
    startDate: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const operation = await operationsApi.create({
        ...formData,
        team: [],        // Optional: Add team members later
        techniques: []   // Optional: Add techniques later
      });
      
      toast({
        title: "Success",
        description: "Operation created successfully",
      });
      setIsOpen(false);
      navigate(`/operations/${operation.id}`);
    } catch (error) {
      console.error('Failed to create operation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create operation",
      });
    } finally {
      setLoading(false);
    }
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
            Enter the details for your new operation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Operation Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter operation name"
              className="bg-secondary"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="target" className="block text-sm font-medium">
              Target
            </label>
            <Input
              id="target"
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
              placeholder="Enter target"
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium">
              Start Date
            </label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-secondary"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.target}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}