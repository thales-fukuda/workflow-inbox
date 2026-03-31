// ============================================================================
// CORE TYPES - GlobGlob Workflow Platform
// ============================================================================

// ----------------------------------------------------------------------------
// Roles & Permissions
// ----------------------------------------------------------------------------

export type RoleId = 'admin' | 'reviewer' | 'finance' | 'operations';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  color: string;
}

// ----------------------------------------------------------------------------
// Task States
// ----------------------------------------------------------------------------

export type TaskState =
  | 'created'
  | 'review'
  | 'running'
  | 'waiting_human'
  | 'waiting_external'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepState =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'skipped';

// ----------------------------------------------------------------------------
// Workflows & Steps
// ----------------------------------------------------------------------------

export type StepType =
  | 'ai_skill'
  | 'connector'
  | 'human'
  | 'review'
  | 'condition';

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  // For human/review steps
  assignTo?: RoleId;
  // For conditions
  condition?: string;
  thenStep?: string;
  elseStep?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  triggerType: 'email' | 'manual' | 'schedule' | 'webhook';
  requiresReview: boolean;
  steps: WorkflowStep[];
}

// ----------------------------------------------------------------------------
// Tasks (Workflow Instances)
// ----------------------------------------------------------------------------

export interface StepExecution {
  stepId: string;
  state: StepState;
  startedAt?: Date;
  completedAt?: Date;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  assignedTo?: RoleId;
  actionRequired?: string;
}

export interface Task {
  id: string;
  workflowId: string;
  title: string;
  state: TaskState;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];

  // Data
  data: Record<string, unknown>;

  // Execution
  currentStepId: string | null;
  stepExecutions: StepExecution[];

  // Assignment
  assignedTo?: RoleId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Source
  triggeredBy: string;
  triggerData?: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// Queues
// ----------------------------------------------------------------------------

export interface Queue {
  id: string;
  name: string;
  icon: string;
  filter: {
    states?: TaskState[];
    assignedTo?: RoleId;
    tags?: string[];
    workflowIds?: string[];
  };
  roleAccess: RoleId[];
}

// ----------------------------------------------------------------------------
// Simulation
// ----------------------------------------------------------------------------

export interface PendingExternalAction {
  id: string;
  taskId: string;
  stepId: string;
  system: string;
  action: string;
  description: string;
  createdAt: Date;
}

// ----------------------------------------------------------------------------
// Invoice Data (for demo)
// ----------------------------------------------------------------------------

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  ean?: string;
}

export interface InvoiceData {
  supplier: string;
  supplierTaxId?: string;
  invoiceNumber: string;
  date: string;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// ----------------------------------------------------------------------------
// Purchase Request Data (for demo)
// ----------------------------------------------------------------------------

export interface PurchaseRequestData {
  requester: string;
  department: string;
  items: {
    description: string;
    quantity: number;
    estimatedPrice: number;
    urgency: 'low' | 'medium' | 'high';
  }[];
  justification: string;
  totalEstimate: number;
  neededBy?: string;
}
