import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from './workflowStore';
import type { InvoiceData } from '../types';

describe('workflowStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useWorkflowStore.setState({ workflows: [], selectedWorkflowId: null });
  });

  describe('simulateInvoiceEmail', () => {
    it('should create a new workflow with pending_approval status', () => {
      const { simulateInvoiceEmail } = useWorkflowStore.getState();

      simulateInvoiceEmail();

      const { workflows } = useWorkflowStore.getState();
      expect(workflows).toHaveLength(1);
      expect(workflows[0].status).toBe('pending_approval');
      expect(workflows[0].workflowType).toBe('invoice_processing');
    });

    it('should add workflows to the beginning of the list', () => {
      const { simulateInvoiceEmail } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const firstId = useWorkflowStore.getState().workflows[0].id;

      simulateInvoiceEmail();
      const { workflows } = useWorkflowStore.getState();

      expect(workflows).toHaveLength(2);
      expect(workflows[0].id).not.toBe(firstId);
      expect(workflows[1].id).toBe(firstId);
    });

    it('should create workflow with extracted data', () => {
      const { simulateInvoiceEmail } = useWorkflowStore.getState();

      simulateInvoiceEmail();

      const { workflows } = useWorkflowStore.getState();
      expect(workflows[0].extractedData).toBeDefined();
      expect(workflows[0].extractedData?.supplier).toBeDefined();
      expect(workflows[0].extractedData?.lineItems).toBeInstanceOf(Array);
    });

    it('should create tasks for the workflow', () => {
      const { simulateInvoiceEmail } = useWorkflowStore.getState();

      simulateInvoiceEmail();

      const { workflows } = useWorkflowStore.getState();
      expect(workflows[0].tasks.length).toBeGreaterThan(0);
      expect(workflows[0].tasks[0].status).toBe('completed'); // parse_invoice is pre-completed
    });
  });

  describe('createWorkflowFromInvoice', () => {
    const mockInvoiceData: InvoiceData = {
      supplier: 'Test Supplier',
      invoiceNumber: 'INV-001',
      date: '2026-03-30',
      total: 1000,
      currency: 'BRL',
      lineItems: [
        { id: '1', name: 'Item 1', supplierCode: 'SKU-001', quantity: 5, unitPrice: 100, ean: '7891234567890', eanStatus: 'resolved', eanSource: 'extracted', isEdited: false, isNewProduct: false },
        { id: '2', name: 'Item 2', supplierCode: null, quantity: 10, unitPrice: 50, ean: null, eanStatus: 'unknown', eanSource: null, isEdited: false, isNewProduct: true },
      ],
      hasUnresolvedEans: true,
      isEdited: false,
    };

    it('should create workflow from provided invoice data', () => {
      const { createWorkflowFromInvoice } = useWorkflowStore.getState();

      createWorkflowFromInvoice(mockInvoiceData, 'test-invoice.xml');

      const { workflows } = useWorkflowStore.getState();
      expect(workflows).toHaveLength(1);
      expect(workflows[0].extractedData).toEqual(mockInvoiceData);
    });

    it('should set event source as upload', () => {
      const { createWorkflowFromInvoice } = useWorkflowStore.getState();

      createWorkflowFromInvoice(mockInvoiceData, 'invoice.pdf');

      const { workflows } = useWorkflowStore.getState();
      expect(workflows[0].event.source).toBe('upload@manual.local');
      expect(workflows[0].event.attachment).toBe('invoice.pdf');
    });

    it('should create SKU tasks for new items', () => {
      const { createWorkflowFromInvoice } = useWorkflowStore.getState();

      createWorkflowFromInvoice(mockInvoiceData, 'test.xml');

      const { workflows } = useWorkflowStore.getState();
      const skuTasks = workflows[0].tasks.filter(t => t.skillId === 'create_sku');
      expect(skuTasks).toHaveLength(1); // Only Item 2 is a new SKU
    });
  });

  describe('selectWorkflow', () => {
    it('should set selectedWorkflowId', () => {
      const { simulateInvoiceEmail, selectWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      selectWorkflow(workflowId);

      expect(useWorkflowStore.getState().selectedWorkflowId).toBe(workflowId);
    });

    it('should allow deselecting by passing null', () => {
      const { simulateInvoiceEmail, selectWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      selectWorkflow(workflowId);
      selectWorkflow(null);

      expect(useWorkflowStore.getState().selectedWorkflowId).toBeNull();
    });
  });

  describe('approveWorkflow', () => {
    it('should change status to running', () => {
      const { simulateInvoiceEmail, approveWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      approveWorkflow(workflowId);

      const workflow = useWorkflowStore.getState().workflows[0];
      expect(workflow.status).toBe('running');
      expect(workflow.approvedAt).toBeDefined();
    });
  });

  describe('rejectWorkflow', () => {
    it('should remove workflow from the list', () => {
      const { simulateInvoiceEmail, rejectWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      rejectWorkflow(workflowId);

      expect(useWorkflowStore.getState().workflows).toHaveLength(0);
    });

    it('should clear selection if rejected workflow was selected', () => {
      const { simulateInvoiceEmail, selectWorkflow, rejectWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      selectWorkflow(workflowId);
      rejectWorkflow(workflowId);

      expect(useWorkflowStore.getState().selectedWorkflowId).toBeNull();
    });
  });

  describe('dismissWorkflow', () => {
    it('should remove workflow from the list', () => {
      const { simulateInvoiceEmail, dismissWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      dismissWorkflow(workflowId);

      expect(useWorkflowStore.getState().workflows).toHaveLength(0);
    });
  });

  describe('retryWorkflow', () => {
    it('should increment retry count', async () => {
      const { simulateInvoiceEmail, retryWorkflow } = useWorkflowStore.getState();

      simulateInvoiceEmail();
      const workflowId = useWorkflowStore.getState().workflows[0].id;

      // Manually set workflow to failed state
      useWorkflowStore.setState(state => ({
        workflows: state.workflows.map(wf =>
          wf.id === workflowId
            ? {
                ...wf,
                status: 'failed' as const,
                tasks: wf.tasks.map((t, i) =>
                  i === 1 ? { ...t, status: 'failed' as const, error: 'Test error' } : t
                ),
              }
            : wf
        ),
      }));

      retryWorkflow(workflowId);

      const workflow = useWorkflowStore.getState().workflows[0];
      expect(workflow.retryCount).toBe(1);
      expect(workflow.status).toBe('running');
    });
  });
});
