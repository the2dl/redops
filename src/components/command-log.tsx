import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Command } from '@/lib/types';
import { AddCommandDialog } from './add-command-dialog';
import { CommandDetails } from './command-details';
import { useState } from 'react';

interface CommandLogProps {
  operationId: string;
}

const mockCommands: Command[] = [
  {
    id: '1',
    timestamp: '2024-03-15T09:15:00',
    command: 'nmap -sS -p- 192.168.1.0/24',
    output: 'Discovered 23 open ports across 5 hosts',
    status: 'success',
    mitreTechniques: ['T1046'],
    impactedEntities: [
      { type: 'ip', value: '192.168.1.0/24' },
      { type: 'service', value: 'ssh' },
    ],
  },
  {
    id: '2',
    timestamp: '2024-03-15T10:30:00',
    command: 'responder -I eth0 -A',
    output: 'Captured NTLM hash from workstation-01',
    status: 'detected',
    mitreTechniques: ['T1557.001'],
    impactedEntities: [
      { type: 'ip', value: '192.168.1.100' },
      { type: 'username', value: 'admin' },
    ],
  },
  {
    id: '3',
    timestamp: '2024-03-15T11:45:00',
    command: 'crackmapexec smb 192.168.1.100 -u admin -p "password123"',
    output: 'Authentication failed',
    status: 'failure',
    mitreTechniques: ['T1110.001'],
    impactedEntities: [
      { type: 'ip', value: '192.168.1.100' },
      { type: 'username', value: 'admin' },
    ],
  },
];

const statusStyles = {
  success: 'bg-green-500/15 text-green-700 dark:text-green-300',
  failure: 'bg-red-500/15 text-red-700 dark:text-red-300',
  detected: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
};

export function CommandLog({ operationId }: CommandLogProps) {
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <AddCommandDialog />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Command</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Impacted Entities</TableHead>
              <TableHead>MITRE ATT&CK</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCommands.map((cmd) => (
              <TableRow
                key={cmd.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedCommand(cmd);
                  setDetailsOpen(true);
                }}
              >
                <TableCell className="whitespace-nowrap">
                  {new Date(cmd.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <code className="px-2 py-1 bg-muted rounded">
                    {cmd.command}
                  </code>
                </TableCell>
                <TableCell>{cmd.output}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusStyles[cmd.status]}
                  >
                    {cmd.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {cmd.impactedEntities?.map((entity, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-secondary"
                      >
                        {entity.type}: {entity.value}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {cmd.mitreTechniques.map((technique) => (
                      <Badge
                        key={technique}
                        variant="outline"
                        className="bg-primary/10"
                      >
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CommandDetails
        command={selectedCommand}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}