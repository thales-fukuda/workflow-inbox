export type WorkflowStatus =
  | 'pending_approval'
  | 'approved'
  | 'running'
  | 'completed'
  | 'failed';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface Skill {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // ms
}

export interface Task {
  id: string;
  skillId: string;
  name: string;
  description: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface LineItem {
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  isNewSku: boolean;
}

export interface InvoiceData {
  supplier: string;
  invoiceNumber: string;
  date: string;
  total: number;
  currency: string;
  lineItems: LineItem[];
}

export interface Event {
  id: string;
  type: 'email_received';
  source: string;
  subject: string;
  attachment?: string;
  receivedAt: Date;
}

export interface WorkflowInstance {
  id: string;
  workflowType: 'invoice_processing' | 'inventory_sync' | 'financial_report';
  status: WorkflowStatus;
  event: Event;
  extractedData?: InvoiceData;
  tasks: Task[];
  currentTaskIndex: number;
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
}
