import { create } from 'zustand';
import type { WorkflowInstance, Task, Event, InvoiceData, LineItem } from '../types';
import { getRandomMockInvoice } from '../data/mockInvoices';
import { skills } from '../data/skills';

interface WorkflowStore {
  workflows: WorkflowInstance[];
  selectedWorkflowId: string | null;

  selectWorkflow: (id: string | null) => void;
  simulateInvoiceEmail: () => void;
  createWorkflowFromInvoice: (data: InvoiceData, fileName: string) => void;
  approveWorkflow: (id: string) => void;
  rejectWorkflow: (id: string) => void;
  retryWorkflow: (id: string) => void;
  dismissWorkflow: (id: string) => void;

  // Editing
  updateExtractedData: (workflowId: string, data: Partial<InvoiceData>) => void;
  updateLineItem: (workflowId: string, itemId: string, updates: Partial<LineItem>) => void;
  resolveEan: (workflowId: string, itemId: string, ean: string, productName?: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createTasksForInvoice = (data: InvoiceData): Task[] => {
  const tasks: Task[] = [];

  tasks.push({
    id: generateId(),
    skillId: 'parse_invoice',
    name: 'Parse Invoice',
    description: `Extract data from ${data.invoiceNumber}`,
    status: 'completed',
  });

  // EAN resolution task if there are unresolved EANs
  const unresolvedItems = data.lineItems.filter(item => item.eanStatus === 'unknown');
  if (unresolvedItems.length > 0) {
    tasks.push({
      id: generateId(),
      skillId: 'resolve_ean',
      name: 'Resolve EANs',
      description: `Resolve ${unresolvedItems.length} unresolved EAN codes`,
      status: 'pending',
    });
  }

  // Create SKU tasks for new products
  const newProducts = data.lineItems.filter(item => item.isNewProduct);
  newProducts.forEach(item => {
    tasks.push({
      id: generateId(),
      skillId: 'create_sku',
      name: `Create SKU: ${item.name}`,
      description: `Register new product in catalog`,
      status: 'pending',
    });
  });

  tasks.push({
    id: generateId(),
    skillId: 'register_invoice',
    name: 'Register Invoice',
    description: `Register ${data.invoiceNumber} in financial system`,
    status: 'pending',
  });

  tasks.push({
    id: generateId(),
    skillId: 'update_inventory',
    name: 'Update Inventory',
    description: `Add ${data.lineItems.reduce((acc, item) => acc + item.quantity, 0)} items to inventory`,
    status: 'pending',
  });

  return tasks;
};

const executeWorkflow = async (
  workflowId: string,
  get: () => WorkflowStore,
  set: (partial: Partial<WorkflowStore> | ((state: WorkflowStore) => Partial<WorkflowStore>)) => void
) => {
  const updateWorkflow = (updater: (wf: WorkflowInstance) => WorkflowInstance) => {
    set(state => ({
      workflows: state.workflows.map(wf =>
        wf.id === workflowId ? updater(wf) : wf
      ),
    }));
  };

  const workflow = get().workflows.find(wf => wf.id === workflowId);
  if (!workflow) return;

  const pendingTasks = workflow.tasks.filter(t => t.status === 'pending');

  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    const skill = skills[task.skillId];

    updateWorkflow(wf => ({
      ...wf,
      currentTaskIndex: wf.tasks.findIndex(t => t.id === task.id),
      tasks: wf.tasks.map(t =>
        t.id === task.id ? { ...t, status: 'running', startedAt: new Date() } : t
      ),
    }));

    await new Promise(resolve => setTimeout(resolve, skill?.estimatedDuration || 1000));

    const shouldFail = Math.random() < 0.1 && get().workflows.filter(w => w.status === 'completed').length > 0;

    if (shouldFail) {
      updateWorkflow(wf => ({
        ...wf,
        status: 'failed',
        tasks: wf.tasks.map(t =>
          t.id === task.id
            ? { ...t, status: 'failed', error: 'Connection timeout - external service unavailable', completedAt: new Date() }
            : t
        ),
      }));
      return;
    }

    updateWorkflow(wf => ({
      ...wf,
      tasks: wf.tasks.map(t =>
        t.id === task.id ? { ...t, status: 'completed', completedAt: new Date() } : t
      ),
    }));
  }

  updateWorkflow(wf => ({
    ...wf,
    status: 'completed',
    completedAt: new Date(),
  }));
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  selectedWorkflowId: null,

  selectWorkflow: (id) => set({ selectedWorkflowId: id }),

  simulateInvoiceEmail: () => {
    const mockData = getRandomMockInvoice();
    const event: Event = {
      ...mockData.event,
      id: generateId(),
      receivedAt: new Date(),
    };

    const workflow: WorkflowInstance = {
      id: generateId(),
      workflowType: 'invoice_processing',
      status: 'pending_approval',
      event,
      extractedData: mockData.extractedData,
      tasks: createTasksForInvoice(mockData.extractedData),
      currentTaskIndex: 0,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };

    set(state => ({
      workflows: [workflow, ...state.workflows],
    }));
  },

  createWorkflowFromInvoice: (data: InvoiceData, fileName: string) => {
    const event: Event = {
      id: generateId(),
      type: 'email_received',
      source: `upload@manual.local`,
      subject: `Uploaded: ${fileName}`,
      attachment: fileName,
      receivedAt: new Date(),
    };

    const workflow: WorkflowInstance = {
      id: generateId(),
      workflowType: 'invoice_processing',
      status: 'pending_approval',
      event,
      extractedData: data,
      tasks: createTasksForInvoice(data),
      currentTaskIndex: 0,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };

    set(state => ({
      workflows: [workflow, ...state.workflows],
    }));
  },

  approveWorkflow: (id) => {
    set(state => ({
      workflows: state.workflows.map(wf =>
        wf.id === id
          ? { ...wf, status: 'running', approvedAt: new Date() }
          : wf
      ),
    }));
    executeWorkflow(id, get, set);
  },

  rejectWorkflow: (id) => {
    set(state => ({
      workflows: state.workflows.filter(wf => wf.id !== id),
      selectedWorkflowId: state.selectedWorkflowId === id ? null : state.selectedWorkflowId,
    }));
  },

  retryWorkflow: (id) => {
    set(state => ({
      workflows: state.workflows.map(wf => {
        if (wf.id !== id) return wf;
        return {
          ...wf,
          status: 'running',
          retryCount: wf.retryCount + 1,
          tasks: wf.tasks.map(t =>
            t.status === 'failed' ? { ...t, status: 'pending', error: undefined } : t
          ),
        };
      }),
    }));
    executeWorkflow(id, get, set);
  },

  dismissWorkflow: (id) => {
    set(state => ({
      workflows: state.workflows.filter(wf => wf.id !== id),
      selectedWorkflowId: state.selectedWorkflowId === id ? null : state.selectedWorkflowId,
    }));
  },

  updateExtractedData: (workflowId, data) => {
    set(state => ({
      workflows: state.workflows.map(wf => {
        if (wf.id !== workflowId || !wf.extractedData) return wf;
        return {
          ...wf,
          extractedData: { ...wf.extractedData, ...data, isEdited: true },
        };
      }),
    }));
  },

  updateLineItem: (workflowId, itemId, updates) => {
    set(state => ({
      workflows: state.workflows.map(wf => {
        if (wf.id !== workflowId || !wf.extractedData) return wf;
        const lineItems = wf.extractedData.lineItems.map(item =>
          item.id === itemId ? { ...item, ...updates, isEdited: true } : item
        );
        const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const hasUnresolvedEans = lineItems.some(item => item.eanStatus === 'unknown');
        return {
          ...wf,
          extractedData: { ...wf.extractedData, lineItems, total, hasUnresolvedEans, isEdited: true },
        };
      }),
    }));
  },

  resolveEan: (workflowId, itemId, ean, productName) => {
    set(state => ({
      workflows: state.workflows.map(wf => {
        if (wf.id !== workflowId || !wf.extractedData) return wf;
        const lineItems = wf.extractedData.lineItems.map(item =>
          item.id === itemId
            ? {
                ...item,
                ean,
                eanStatus: 'manual' as const,
                eanSource: 'user' as const,
                name: productName || item.name,
                isNewProduct: false,
                isEdited: true,
              }
            : item
        );
        const hasUnresolvedEans = lineItems.some(item => item.eanStatus === 'unknown');
        return {
          ...wf,
          extractedData: { ...wf.extractedData, lineItems, hasUnresolvedEans, isEdited: true },
        };
      }),
    }));
  },
}));
