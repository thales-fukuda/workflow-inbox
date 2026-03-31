import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { WORKFLOWS } from '../data/workflows';
import { Icon } from './Icon';
import type { InvoiceData, PurchaseRequestData } from '../types';

export const SimulationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('invoice-processing');
  const { createTask, pendingExternalActions, completeExternalAction } = useTaskStore();

  const handleCreateTask = () => {
    const workflow = WORKFLOWS[selectedWorkflow];
    if (!workflow) return;

    let data: InvoiceData | PurchaseRequestData;
    let title: string;

    if (selectedWorkflow === 'invoice-processing') {
      data = generateMockInvoice();
      title = `Invoice ${data.invoiceNumber}`;
    } else if (selectedWorkflow === 'purchase-request') {
      data = generateMockPurchaseRequest();
      title = `PR: ${data.items[0]?.description || 'New Request'}`;
    } else {
      data = { type: 'generic' } as unknown as InvoiceData;
      title = `Task ${Date.now()}`;
    }

    createTask(selectedWorkflow, title, data as unknown as Record<string, unknown>, 'simulation');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center z-50"
        title="Simulation Panel"
      >
        <Icon name="cog" size={24} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Simulation Panel</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="x-mark" size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Create mock tasks and trigger external actions
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Create Task */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Create New Task
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedWorkflow}
                  onChange={(e) => setSelectedWorkflow(e.target.value)}
                  className="flex-1 form-select text-sm"
                >
                  {Object.entries(WORKFLOWS).map(([id, workflow]) => (
                    <option key={id} value={id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateTask}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Pending External Actions */}
            {pendingExternalActions.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">
                  Pending External Actions ({pendingExternalActions.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingExternalActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-900">
                          {action.system}
                        </span>
                        <span className="text-xs text-gray-500">
                          {action.taskId.slice(-6)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{action.description}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            completeExternalAction(action.id, {
                              success: true,
                              message: 'Completed via simulation',
                            })
                          }
                          className="flex-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                        >
                          Success
                        </button>
                        <button
                          onClick={() =>
                            completeExternalAction(action.id, {
                              success: false,
                              error: 'Simulated failure',
                            })
                          }
                          className="flex-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Quick Actions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedWorkflow('invoice-processing');
                    handleCreateTask();
                  }}
                  className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  + Invoice
                </button>
                <button
                  onClick={() => {
                    setSelectedWorkflow('purchase-request');
                    handleCreateTask();
                  }}
                  className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  + Purchase Request
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-xs text-gray-400 text-center">
              Simulation mode - data is not persisted
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// Mock Data Generators
// ============================================================================

const SUPPLIERS = [
  'Acme Corp',
  'Global Supplies Ltd',
  'Tech Solutions Inc',
  'Office Essentials',
  'Industrial Parts Co',
];

const PRODUCTS = [
  { name: 'Office Chair', price: 299.99 },
  { name: 'Standing Desk', price: 549.99 },
  { name: 'Monitor 27"', price: 399.99 },
  { name: 'Keyboard Wireless', price: 79.99 },
  { name: 'Mouse Ergonomic', price: 49.99 },
  { name: 'Webcam HD', price: 129.99 },
  { name: 'Headset Pro', price: 199.99 },
  { name: 'USB Hub', price: 39.99 },
  { name: 'Laptop Stand', price: 89.99 },
  { name: 'Cable Management Kit', price: 29.99 },
];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

function generateMockInvoice(): InvoiceData {
  const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
  const numItems = Math.floor(Math.random() * 4) + 1;
  const lineItems = [];

  for (let i = 0; i < numItems; i++) {
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    lineItems.push({
      id: `item-${Date.now()}-${i}`,
      name: product.name,
      quantity,
      unitPrice: product.price,
      ean: Math.random() > 0.5 ? generateEAN() : undefined,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return {
    supplier,
    supplierTaxId: `TAX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    lineItems,
    subtotal,
    tax,
    total,
    currency: 'USD',
  };
}

function generateMockPurchaseRequest(): PurchaseRequestData {
  const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const quantity = Math.floor(Math.random() * 10) + 1;
  const urgencies: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];

  return {
    requester: `User ${Math.floor(Math.random() * 100)}`,
    department,
    justification: `Required for ${department.toLowerCase()} team operations`,
    totalEstimate: product.price * quantity,
    neededBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        description: product.name,
        quantity,
        estimatedPrice: product.price,
        urgency,
      },
    ],
  };
}

function generateEAN(): string {
  let ean = '';
  for (let i = 0; i < 13; i++) {
    ean += Math.floor(Math.random() * 10);
  }
  return ean;
}
