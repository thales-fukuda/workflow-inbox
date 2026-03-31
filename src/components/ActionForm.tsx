import type { Task, WorkflowStep, StepExecution } from '../types';

interface ActionFormProps {
  task: Task;
  step: WorkflowStep;
  stepExecution?: StepExecution;
}

export const ActionForm = ({ task, step, stepExecution }: ActionFormProps) => {
  // Render different action forms based on step configuration
  const actionType = step.config?.actionType || 'generic';

  return (
    <div className="space-y-4">
      {/* Action Description */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-medium text-amber-900">{step.name}</h3>
            <p className="text-sm text-amber-700 mt-1">
              {stepExecution?.actionRequired || step.description || 'This step requires your action to continue.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action-specific content */}
      {actionType === 'approval' && (
        <ApprovalAction task={task} step={step} />
      )}

      {actionType === 'data_entry' && (
        <DataEntryAction task={task} step={step} />
      )}

      {actionType === 'verification' && (
        <VerificationAction task={task} step={step} />
      )}

      {actionType === 'generic' && (
        <GenericAction task={task} step={step} />
      )}
    </div>
  );
};

// ============================================================================
// Approval Action
// ============================================================================

const ApprovalAction = ({ task, step }: { task: Task; step: WorkflowStep }) => {
  const threshold = (step.config?.threshold as number) || 0;
  const total = (task.data as { total?: number })?.total || 0;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Amount</span>
            <p className="font-semibold text-gray-900 text-lg">
              ${total.toFixed(2)}
            </p>
          </div>
          {threshold > 0 && (
            <div>
              <span className="text-gray-500">Threshold</span>
              <p className="font-medium text-gray-700">
                ${threshold.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>By completing this action, you are approving this request.</p>
      </div>
    </div>
  );
};

// ============================================================================
// Data Entry Action
// ============================================================================

const DataEntryAction = ({ step }: { task: Task; step: WorkflowStep }) => {
  const fields = (step.config?.fields as string[]) || [];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Required Information</h4>
        <div className="space-y-3">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <div key={index}>
                <label className="form-label">{field}</label>
                <input type="text" className="form-input" placeholder={`Enter ${field.toLowerCase()}`} />
              </div>
            ))
          ) : (
            <div>
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea h-24"
                placeholder="Enter any relevant information..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Verification Action
// ============================================================================

const VerificationAction = ({ step }: { task: Task; step: WorkflowStep }) => {
  const checklistItems = (step.config?.checklist as string[]) || [
    'Information has been verified',
    'All required documents are present',
    'Data matches source records',
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Verification Checklist</h4>
        <div className="space-y-2">
          {checklistItems.map((item, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Generic Action
// ============================================================================

const GenericAction = ({ task, step }: { task: Task; step: WorkflowStep }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Action Details</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <span className="font-medium">Step:</span> {step.name}
          </p>
          {step.description && (
            <p>
              <span className="font-medium">Description:</span> {step.description}
            </p>
          )}
          <p>
            <span className="font-medium">Task ID:</span> {task.id}
          </p>
        </div>
      </div>

      <div>
        <label className="form-label">Comments (optional)</label>
        <textarea
          className="form-textarea h-20"
          placeholder="Add any comments about this action..."
        />
      </div>
    </div>
  );
};
