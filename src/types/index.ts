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

export type EanStatus = 'resolved' | 'suggested' | 'manual' | 'unknown';
export type EanSource = 'extracted' | 'mapping' | 'database' | 'user';

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

export interface EanSuggestion {
  ean: string;
  productName: string;
  brand?: string;
  confidence: number;
  source: string;
  imageUrl?: string;
}

export interface LineItem {
  id: string;
  name: string;
  supplierCode: string | null;
  quantity: number;
  unitPrice: number;

  // EAN Resolution
  ean: string | null;
  eanStatus: EanStatus;
  eanSource: EanSource | null;
  eanConfidence?: number;
  eanSuggestions?: EanSuggestion[];

  // Tracking
  isEdited: boolean;
  isNewProduct: boolean;
}

export interface InvoiceData {
  supplier: string;
  supplierCode?: string;
  invoiceNumber: string;
  date: string;
  total: number;
  currency: string;
  lineItems: LineItem[];

  // Validation
  hasUnresolvedEans: boolean;
  isEdited: boolean;
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

// Product Catalog
export interface Product {
  id: string;
  ean: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  source: 'manual' | 'invoice' | 'api';
}

// Supplier Mapping
export interface SupplierProductMapping {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierProductCode: string;
  supplierProductName: string;
  ean: string;
  confidence: 'manual' | 'confirmed' | 'suggested';
  createdAt: Date;
  lastSeenAt: Date;
}
