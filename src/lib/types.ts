import { LucideIcon } from 'lucide-react';

export type OperationStatus = 'ongoing' | 'completed' | 'planned' | 'cancelled';

export interface Operation {
  id: string;
  name: string;
  status: OperationStatus;
  startDate: string;
  endDate?: string;
  target: string;
  successRate?: number;
  findings: number;
  detections?: number;
  criticalFindings?: number;
  techniques?: number;
  progress?: number;
}

export interface DashboardStats {
  totalOperations: number;
  activeOperations: number;
  completedOperations: number;
  averageSuccessRate: number;
  totalFindings: number;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  commandId: string;
  milestoneId?: string;
  timestamp: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned' | 'blocked';
  description: string;
  findings: number;
  techniques: string[];
  phase: 'reconnaissance' | 'initial-access' | 'persistence' | 'privilege-escalation' | 'exfiltration';
}

export interface Command {
  id: string;
  timestamp: string;
  command: string;
  output: string;
  status: 'success' | 'failure' | 'detected';
  mitreTechniques: string[];
  finding?: Finding;
}

export interface Task {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  command?: string;
  techniques: string[];
}

export interface Phase {
  name: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tasks: Task[];
}

export interface Plan {
  objective: string;
  scope: string[];
  phases: Phase[];
}