import { Operation } from '@/lib/types';
import { operationsApi } from '@/api';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  FileText, 
  FileWarning, 
  FileDigit, 
  ChevronRight, 
  Users, 
  Target, 
  BarChart3, 
  Download 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface OperationsListProps {
  title: string;
}

const statusColors = {
  ongoing: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  completed: 'bg-green-500/15 text-green-700 dark:text-green-300',
  planned: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function OperationsList({ title }: OperationsListProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        setLoading(true);
        const data = await operationsApi.getAll();
        setOperations(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch operations');
        console.error('Error fetching operations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, []);

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.name.toLowerCase().includes(search.toLowerCase()) ||
      op.target.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || op.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div>Loading operations...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search operations..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {statusFilter !== 'all' && (
          <Button
            variant="ghost"
            onClick={() => {
              setStatusFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operation Name</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.map((op) => (
              <TableRow key={op.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link to={`/operations/${op.id}`} className="hover:underline">
                    {op.name}
                  </Link>
                </TableCell>
                <TableCell>{op.target}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[op.status]}
                  >
                    {op.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(op.startDate), 'PPP')}
                </TableCell>
                <TableCell>{op.findings}</TableCell>
                <TableCell className="text-right">
                  {op.successRate ? `${op.successRate}%` : '-'}
                </TableCell>
                <TableCell>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[500px]">
                      <SheetHeader>
                        <SheetTitle className="text-xl">{op.name}</SheetTitle>
                      </SheetHeader>
                      
                      <div className="mt-6 space-y-6">
                        {/* Overview Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Overview</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Target</p>
                                <p className="text-sm text-muted-foreground">{op.target}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Success Rate</p>
                                <p className="text-sm text-muted-foreground">
                                  {op.successRate ? `${op.successRate}%` : '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Entities</p>
                                <p className="text-sm text-muted-foreground">
                                  {op.entities?.length || 0} identified
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Findings Section */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">Findings</h3>
                          <p className="text-sm text-muted-foreground">
                            {op.findings || 'No findings recorded'}
                          </p>
                        </div>

                        {/* Entities Section */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">Identified Entities</h3>
                          <div className="space-y-2">
                            {op.entities?.map((entity, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{entity}</span>
                              </div>
                            )) || (
                              <p className="text-sm text-muted-foreground">No entities identified</p>
                            )}
                          </div>
                        </div>

                        {/* Reports Section */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">Generate Report</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start">
                              <FileText className="mr-2 h-4 w-4" />
                              Technical Report
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <FileWarning className="mr-2 h-4 w-4" />
                              Executive Summary
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <FileDigit className="mr-2 h-4 w-4" />
                              Statistics Report
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Download className="mr-2 h-4 w-4" />
                              Export All Data
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}