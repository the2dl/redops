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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Globe, Users } from 'lucide-react';
import { Plan } from '@/lib/types';
import { mockPlan } from '@/lib/mock-data';

const THREAT_ACTORS = [
  { id: 'apt28', name: 'APT28 (Fancy Bear)', origin: 'Russia' },
  { id: 'apt29', name: 'APT29 (Cozy Bear)', origin: 'Russia' },
  { id: 'lazarus', name: 'Lazarus Group', origin: 'North Korea' },
  { id: 'apt41', name: 'APT41 (Double Dragon)', origin: 'China' },
  { id: 'fin7', name: 'FIN7', origin: 'Russia' },
  { id: 'carbonak', name: 'Carbanak', origin: 'Russia' },
];

export function CreateAIOperationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedActor, setSelectedActor] = useState<string>('');
  const [reportUrl, setReportUrl] = useState('');
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (type: 'file' | 'actor' | 'url') => {
    const newOperationId = uuidv4();
    // Here you would typically send the data to your AI processing endpoint
    console.log('Creating AI operation with:', {
      type,
      data: type === 'file' ? selectedFile?.name : type === 'actor' ? selectedActor : reportUrl
    });
    setIsOpen(false);
    navigate(`/operations/${newOperationId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          AI Operation Genesis
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background text-foreground sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Operation Genesis</DialogTitle>
          <DialogDescription>
            Create an AI-powered operation using one of the following methods.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="actor">Threat Actor</TabsTrigger>
            <TabsTrigger value="url">Report URL</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Upload PDF or CSV
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "Upload threat intel report"}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.csv"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <Button 
                className="w-full" 
                disabled={!selectedFile}
                onClick={() => handleSubmit('file')}
              >
                Generate Operation
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="actor" className="space-y-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Select Threat Actor
              </label>
              <Select value={selectedActor} onValueChange={setSelectedActor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a threat actor" />
                </SelectTrigger>
                <SelectContent>
                  {THREAT_ACTORS.map((actor) => (
                    <SelectItem key={actor.id} value={actor.id}>
                      {actor.name} ({actor.origin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="w-full" 
                disabled={!selectedActor}
                onClick={() => handleSubmit('actor')}
              >
                Generate Operation
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Threat Report URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/threat-report"
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                className="bg-secondary text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                className="w-full" 
                disabled={!reportUrl}
                onClick={() => handleSubmit('url')}
              >
                Generate Operation
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}