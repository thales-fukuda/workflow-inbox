import { describe, it, expect } from 'vitest';
import type {
  TaskState,
  StepState,
  Task,
  Workflow,
  WorkflowStep,
  InvoiceData,
  LineItem,
  PurchaseRequestData,
  Queue,
  RoleId,
} from './index';

describe('Type definitions', () => {
  describe('TaskState', () => {
    it('should allow valid task states', () => {
      const states: TaskState[] = [
        'created',
        'review',
        'running',
        'waiting_human',
        'waiting_external',
        'paused',
        'completed',
        'failed',
        'cancelled',
      ];
      expect(states).toHaveLength(9);
    });
  });

  describe('StepState', () => {
    it('should allow valid step states', () => {
      const states: StepState[] = [
        'pending',
        'running',
        'waiting',
        'completed',
        'failed',
        'skipped',
      ];
      expect(states).toHaveLength(6);
    });
  });

  describe('Task', () => {
    it('should have required properties', () => {
      const task: Task = {
        id: 'task-1',
        workflowId: 'invoice-processing',
        title: 'Test Invoice',
        state: 'review',
        priority: 'medium',
        tags: ['invoice'],
        data: {},
        currentStepId: 'step-1',
        stepExecutions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        triggeredBy: 'email',
      };
      expect(task.state).toBe('review');
      expect(task.priority).toBe('medium');
    });

    it('should allow optional properties', () => {
      const task: Task = {
        id: 'task-2',
        workflowId: 'purchase-request',
        title: 'Test PR',
        state: 'completed',
        priority: 'high',
        tags: [],
        data: { total: 1000 },
        currentStepId: null,
        stepExecutions: [],
        assignedTo: 'finance',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        triggeredBy: 'manual',
        triggerData: { user: 'admin' },
      };
      expect(task.assignedTo).toBe('finance');
      expect(task.completedAt).toBeDefined();
    });
  });

  describe('Workflow', () => {
    it('should have required properties', () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        icon: '📋',
        category: 'test',
        triggerType: 'manual',
        requiresReview: true,
        steps: [],
      };
      expect(workflow.requiresReview).toBe(true);
      expect(workflow.triggerType).toBe('manual');
    });
  });

  describe('WorkflowStep', () => {
    it('should have required properties', () => {
      const step: WorkflowStep = {
        id: 'step-1',
        type: 'ai_skill',
        name: 'Extract Data',
        config: { skillId: 'extraction' },
      };
      expect(step.type).toBe('ai_skill');
    });

    it('should allow optional properties for human steps', () => {
      const step: WorkflowStep = {
        id: 'step-2',
        type: 'human',
        name: 'Manual Review',
        description: 'Review the extracted data',
        config: { actionRequired: 'Please verify' },
        assignTo: 'reviewer',
      };
      expect(step.assignTo).toBe('reviewer');
    });

    it('should allow condition steps', () => {
      const step: WorkflowStep = {
        id: 'step-3',
        type: 'condition',
        name: 'Check Amount',
        config: {},
        condition: 'total > 1000',
        thenStep: 'step-approval',
        elseStep: 'step-complete',
      };
      expect(step.condition).toBe('total > 1000');
    });
  });

  describe('LineItem', () => {
    it('should have required properties', () => {
      const item: LineItem = {
        id: '1',
        name: 'Product',
        quantity: 5,
        unitPrice: 10.5,
      };
      expect(item.quantity).toBe(5);
    });

    it('should allow optional ean', () => {
      const item: LineItem = {
        id: '2',
        name: 'Product with EAN',
        quantity: 1,
        unitPrice: 100,
        ean: '7891234567890',
      };
      expect(item.ean).toBe('7891234567890');
    });
  });

  describe('InvoiceData', () => {
    it('should have required properties', () => {
      const invoice: InvoiceData = {
        supplier: 'Test Supplier',
        invoiceNumber: 'INV-001',
        date: '2026-03-30',
        currency: 'USD',
        lineItems: [],
        subtotal: 100,
        tax: 10,
        total: 110,
      };
      expect(invoice.currency).toBe('USD');
      expect(invoice.total).toBe(110);
    });
  });

  describe('PurchaseRequestData', () => {
    it('should have required properties', () => {
      const pr: PurchaseRequestData = {
        requester: 'John Doe',
        department: 'Engineering',
        items: [
          { description: 'Laptop', quantity: 1, estimatedPrice: 1500, urgency: 'high' },
        ],
        justification: 'Development work',
        totalEstimate: 1500,
      };
      expect(pr.department).toBe('Engineering');
      expect(pr.items[0].urgency).toBe('high');
    });
  });

  describe('Queue', () => {
    it('should have required properties', () => {
      const queue: Queue = {
        id: 'my-review',
        name: 'My Review',
        icon: '📝',
        filter: {
          states: ['review'],
        },
        roleAccess: ['admin', 'reviewer'],
      };
      expect(queue.filter.states).toContain('review');
      expect(queue.roleAccess).toContain('admin');
    });
  });

  describe('RoleId', () => {
    it('should allow valid role IDs', () => {
      const roles: RoleId[] = ['admin', 'reviewer', 'finance', 'operations'];
      expect(roles).toHaveLength(4);
    });
  });
});
