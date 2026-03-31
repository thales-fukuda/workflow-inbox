import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import type { Task, InvoiceData, PurchaseRequestData } from '../types';

interface ReviewFormProps {
  task: Task;
}

export const ReviewForm = ({ task }: ReviewFormProps) => {
  // Determine form type based on workflow
  if (task.workflowId === 'invoice-processing') {
    return <InvoiceReviewForm task={task} />;
  }

  if (task.workflowId === 'purchase-request') {
    return <PurchaseRequestReviewForm task={task} />;
  }

  // Generic JSON form
  return <GenericReviewForm task={task} />;
};

// ============================================================================
// Invoice Review Form
// ============================================================================

const InvoiceReviewForm = ({ task }: { task: Task }) => {
  const updateTaskData = useTaskStore((s) => s.updateTaskData);
  const data = task.data as unknown as InvoiceData;

  const [formData, setFormData] = useState<InvoiceData>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: keyof InvoiceData, value: unknown) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateTaskData(task.id, updated);
  };

  const handleLineItemChange = (index: number, field: string, value: unknown) => {
    const lineItems = [...formData.lineItems];
    lineItems[index] = { ...lineItems[index], [field]: value };

    // Recalculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const updated = { ...formData, lineItems, subtotal, total: subtotal + (formData.tax || 0) };

    setFormData(updated);
    updateTaskData(task.id, updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Supplier</label>
          <input
            type="text"
            className="form-input"
            value={formData.supplier || ''}
            onChange={(e) => handleChange('supplier', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Supplier Tax ID</label>
          <input
            type="text"
            className="form-input"
            value={formData.supplierTaxId || ''}
            onChange={(e) => handleChange('supplierTaxId', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Invoice Number</label>
          <input
            type="text"
            className="form-input"
            value={formData.invoiceNumber || ''}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={formData.date || ''}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className="form-label">Line Items</label>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="w-20">Qty</th>
                <th className="w-28">Unit Price</th>
                <th className="w-32">EAN</th>
                <th className="w-28 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {formData.lineItems?.map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={item.name}
                      onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input text-right"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input text-right"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={`form-input font-mono text-xs ${
                        !item.ean ? 'border-amber-300 bg-amber-50' : ''
                      }`}
                      value={item.ean || ''}
                      placeholder="Enter EAN"
                      onChange={(e) => handleLineItemChange(index, 'ean', e.target.value)}
                    />
                  </td>
                  <td className="text-right font-medium">
                    {formData.currency} {(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">
              {formData.currency} {formData.subtotal?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <input
              type="number"
              step="0.01"
              className="form-input w-24 text-right"
              value={formData.tax || 0}
              onChange={(e) => {
                const tax = parseFloat(e.target.value) || 0;
                handleChange('tax', tax);
                handleChange('total', (formData.subtotal || 0) + tax);
              }}
            />
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>
              {formData.currency} {formData.total?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Purchase Request Review Form
// ============================================================================

const PurchaseRequestReviewForm = ({ task }: { task: Task }) => {
  const updateTaskData = useTaskStore((s) => s.updateTaskData);
  const data = task.data as unknown as PurchaseRequestData;

  const [formData, setFormData] = useState<PurchaseRequestData>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: keyof PurchaseRequestData, value: unknown) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateTaskData(task.id, updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Requester</label>
          <input
            type="text"
            className="form-input"
            value={formData.requester || ''}
            onChange={(e) => handleChange('requester', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Department</label>
          <input
            type="text"
            className="form-input"
            value={formData.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="form-label">Justification</label>
        <textarea
          className="form-textarea h-20"
          value={formData.justification || ''}
          onChange={(e) => handleChange('justification', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Total Estimate</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData.totalEstimate || 0}
            onChange={(e) => handleChange('totalEstimate', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="form-label">Needed By</label>
          <input
            type="date"
            className="form-input"
            value={formData.neededBy || ''}
            onChange={(e) => handleChange('neededBy', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Generic Review Form
// ============================================================================

const GenericReviewForm = ({ task }: { task: Task }) => {
  const updateTaskData = useTaskStore((s) => s.updateTaskData);
  const [jsonValue, setJsonValue] = useState(JSON.stringify(task.data, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      setError(null);
      updateTaskData(task.id, parsed);
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <div>
      <label className="form-label">Task Data (JSON)</label>
      <textarea
        className={`form-textarea font-mono text-xs h-64 ${error ? 'border-red-300' : ''}`}
        value={jsonValue}
        onChange={(e) => handleChange(e.target.value)}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
