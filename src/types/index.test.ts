import { describe, it, expect } from 'vitest';
import type {
  WorkflowStatus,
  TaskStatus,
  Skill,
  Task,
  WorkflowInstance,
  InvoiceData,
  LineItem,
  Event,
} from './index';

describe('Type definitions', () => {
  describe('WorkflowStatus', () => {
    it('should allow valid workflow statuses', () => {
      const statuses: WorkflowStatus[] = [
        'pending_approval',
        'approved',
        'running',
        'completed',
        'failed',
      ];
      expect(statuses).toHaveLength(5);
    });
  });

  describe('TaskStatus', () => {
    it('should allow valid task statuses', () => {
      const statuses: TaskStatus[] = [
        'pending',
        'running',
        'completed',
        'failed',
        'skipped',
      ];
      expect(statuses).toHaveLength(5);
    });
  });

  describe('Skill', () => {
    it('should have required properties', () => {
      const skill: Skill = {
        id: 'test_skill',
        name: 'Test Skill',
        description: 'A test skill',
        estimatedDuration: 1000,
      };
      expect(skill.id).toBe('test_skill');
      expect(skill.estimatedDuration).toBe(1000);
    });
  });

  describe('Task', () => {
    it('should have required properties', () => {
      const task: Task = {
        id: 'task-1',
        skillId: 'test_skill',
        name: 'Test Task',
        description: 'A test task',
        status: 'pending',
      };
      expect(task.status).toBe('pending');
    });

    it('should allow optional properties', () => {
      const task: Task = {
        id: 'task-1',
        skillId: 'test_skill',
        name: 'Test Task',
        description: 'A test task',
        status: 'failed',
        error: 'Something went wrong',
        result: { data: 'test' },
        startedAt: new Date(),
        completedAt: new Date(),
      };
      expect(task.error).toBe('Something went wrong');
    });
  });

  describe('LineItem', () => {
    it('should have required properties', () => {
      const item: LineItem = {
        name: 'Product',
        sku: 'SKU-001',
        quantity: 5,
        unitPrice: 10.5,
        isNewSku: false,
      };
      expect(item.isNewSku).toBe(false);
    });

    it('should allow null sku for new items', () => {
      const item: LineItem = {
        name: 'New Product',
        sku: null,
        quantity: 1,
        unitPrice: 100,
        isNewSku: true,
      };
      expect(item.sku).toBeNull();
      expect(item.isNewSku).toBe(true);
    });
  });

  describe('InvoiceData', () => {
    it('should have required properties', () => {
      const invoice: InvoiceData = {
        supplier: 'Test Supplier',
        invoiceNumber: 'INV-001',
        date: '2026-03-30',
        total: 1000,
        currency: 'BRL',
        lineItems: [],
      };
      expect(invoice.currency).toBe('BRL');
    });
  });

  describe('Event', () => {
    it('should have required properties', () => {
      const event: Event = {
        id: 'event-1',
        type: 'email_received',
        source: 'test@example.com',
        subject: 'Test Email',
        receivedAt: new Date(),
      };
      expect(event.type).toBe('email_received');
    });

    it('should allow optional attachment', () => {
      const event: Event = {
        id: 'event-1',
        type: 'email_received',
        source: 'test@example.com',
        subject: 'Invoice',
        attachment: 'invoice.pdf',
        receivedAt: new Date(),
      };
      expect(event.attachment).toBe('invoice.pdf');
    });
  });

  describe('WorkflowInstance', () => {
    it('should have all required properties', () => {
      const event: Event = {
        id: 'event-1',
        type: 'email_received',
        source: 'test@example.com',
        subject: 'Test',
        receivedAt: new Date(),
      };

      const workflow: WorkflowInstance = {
        id: 'wf-1',
        workflowType: 'invoice_processing',
        status: 'pending_approval',
        event,
        tasks: [],
        currentTaskIndex: 0,
        createdAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
      };

      expect(workflow.workflowType).toBe('invoice_processing');
      expect(workflow.maxRetries).toBe(3);
    });
  });
});
