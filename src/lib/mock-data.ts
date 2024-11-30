import { Operation, DashboardStats, Plan } from './types';
import {
  Crosshair,
  KeyRound,
  Shield,
  ArrowUpRight,
  Download,
} from 'lucide-react';

export const operations: Operation[] = [
  {
    id: '1',
    name: 'Operation Alpha',
    status: 'ongoing',
    target: 'Example Target 1',
    startDate: '2024-01-01',
    endDate: null,
    progress: 65,
    successRate: 78,
    criticalFindings: [
      {
        title: 'Unauthorized Access Detected',
        description: 'Found evidence of unauthorized access attempts on the main server.',
        severity: 'High',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        title: 'Data Exfiltration Attempt',
        description: 'Detected potential data exfiltration through port 443.',
        severity: 'Critical',
        timestamp: '2024-01-16T15:45:00Z'
      }
    ],
    detections: [
      {
        name: 'Suspicious Process Creation',
        details: 'Unusual process spawned from system32 directory',
        type: 'Process',
        timestamp: '2024-01-15T08:20:00Z'
      },
      {
        name: 'Network Anomaly',
        details: 'Unexpected outbound connection to unknown IP',
        type: 'Network',
        timestamp: '2024-01-15T09:15:00Z'
      }
    ],
    techniques: [
      {
        id: 'T1595',
        name: 'Active Scanning',
        description: 'Adversaries may execute active reconnaissance scans to gather information.',
        tactic: 'Reconnaissance'
      },
      {
        id: 'T1190',
        name: 'Exploit Public-Facing Application',
        description: 'Adversaries may attempt to take advantage of vulnerabilities in public-facing applications.',
        tactic: 'Initial Access'
      }
    ],
    team: [
      {
        id: 'op1',
        name: 'John Doe',
        role: 'Lead Operator',
        avatar: '/avatars/john-doe.png'
      },
      {
        id: 'op2',
        name: 'Jane Smith',
        role: 'Security Analyst',
        avatar: '/avatars/jane-smith.png'
      }
    ]
  },
  {
    id: '2',
    name: 'Project Sentinel',
    status: 'completed',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    target: 'Cloud Services',
    findings: 23,
    successRate: 92,
    detections: 1,
    criticalFindings: 4,
    techniques: 28,
    progress: 100
  },
  {
    id: '3',
    name: 'Operation Firewall',
    status: 'planned',
    startDate: '2024-04-01',
    target: 'External API Gateway',
    findings: 0,
    progress: 0
  },
  {
    id: '4',
    name: 'Project Guardian',
    status: 'cancelled',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    target: 'Legacy Systems',
    findings: 3,
    successRate: 45,
    detections: 5,
    criticalFindings: 1,
    techniques: 8,
    progress: 30
  },
];

export const dashboardStats: DashboardStats = {
  totalOperations: 23,
  activeOperations: 8,
  completedOperations: 12,
  averageSuccessRate: 85,
  totalFindings: 156,
};

export const mockPlan: Plan = {
  objective: "Conduct a comprehensive security assessment of the target organization's network infrastructure and identify potential vulnerabilities that could be exploited by malicious actors.",
  scope: [
    "Internal network (192.168.1.0/24)",
    "External-facing web applications",
    "VPN endpoints",
    "Employee workstations",
    "Server infrastructure"
  ],
  phases: [
    {
      name: "reconnaissance",
      title: "Reconnaissance",
      description: "Gather information about the target environment and identify potential entry points",
      icon: Crosshair,
      tasks: [
        {
          title: "Network Scanning",
          description: "Perform comprehensive port scanning of the target network",
          status: "completed",
          command: "nmap -sS -p- 192.168.1.0/24",
          techniques: ["T1046"]
        },
        {
          title: "Service Enumeration",
          description: "Identify running services and their versions",
          status: "completed",
          command: "nmap -sV -sC -p80,443,22 192.168.1.0/24",
          techniques: ["T1046"]
        }
      ]
    },
    {
      name: "initial-access",
      title: "Initial Access",
      description: "Establish initial foothold in the target environment",
      icon: Shield,
      tasks: [
        {
          title: "Web Application Testing",
          description: "Test identified web applications for vulnerabilities",
          status: "in-progress",
          techniques: ["T1190"]
        }
      ]
    },
    {
      name: "persistence",
      title: "Persistence",
      description: "Establish persistent access to compromised systems",
      icon: KeyRound,
      tasks: [
        {
          title: "Backdoor Implementation",
          description: "Deploy persistent access mechanism",
          status: "planned",
          techniques: ["T1505.003"]
        }
      ]
    },
    {
      name: "privilege-escalation",
      title: "Privilege Escalation",
      description: "Elevate privileges on compromised systems",
      icon: ArrowUpRight,
      tasks: [
        {
          title: "Local Privilege Escalation",
          description: "Attempt to gain administrative privileges",
          status: "planned",
          techniques: ["T1068"]
        }
      ]
    },
    {
      name: "exfiltration",
      title: "Exfiltration",
      description: "Identify and exfiltrate target data",
      icon: Download,
      tasks: [
        {
          title: "Data Collection",
          description: "Identify and collect sensitive data",
          status: "planned",
          techniques: ["T1048"]
        }
      ]
    }
  ]
};