import { LucideIcon } from 'lucide-react';

export type OperationStatus = 'ongoing' | 'completed' | 'planned' | 'cancelled';

export interface Operation {
  id: number;
  name: string;
  target: string;
  status: 'ongoing' | 'completed' | 'planned' | 'cancelled';
  startDate: string;
  endDate?: string;
  successRate?: number;
  findings?: string;
  entities?: string[];
  criticalFindings?: any[];
  detections?: any[];
  techniques?: any[];
  team?: any[];
  critical_findings_count?: number;
  detections_count?: number;
  techniques_count?: number;
  created_at: string;
  updated_at: string;
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
  impactedEntities?: Array<{
    type: 'ip' | 'hostname' | 'username' | 'service' | 'filename' | 'hash' | 'other';
    value: string;
  }>;
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

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface CriticalFinding {
  title: string;
  description: string;
  severity: string;
  timestamp: string;
}

interface Detection {
  name: string;
  details: string;
  type: string;
  timestamp: string;
}

interface MitreTechnique {
  id: string;
  name: string;
  description: string;
  tactic: string;
}