import { WORKFLOWS } from '../data/workflows';
import type { Task, StepState } from '../types';

interface WorkflowProgressProps {
  task: Task;
}

const STEP_ICONS: Record<StepState, string> = {
  pending: '○',
  running: '●',
  waiting: '◐',
  completed: '✓',
  failed: '✗',
  skipped: '–',
};

export const WorkflowProgress = ({ task }: WorkflowProgressProps) => {
  const workflow = WORKFLOWS[task.workflowId];

  if (!workflow) {
    return <p className="text-sm text-gray-500">Workflow not found</p>;
  }

  return (
    <div className="space-y-1">
      {workflow.steps.map((step) => {
        const execution = task.stepExecutions.find((se) => se.stepId === step.id);
        const state = execution?.state || 'pending';
        const isCurrent = task.currentStepId === step.id;

        return (
          <div
            key={step.id}
            className={`flex items-start gap-3 py-2 px-2 rounded-md ${
              isCurrent ? 'bg-blue-50' : ''
            }`}
          >
            {/* Step Indicator */}
            <div className={`step-indicator step-${state}`}>
              {state === 'running' ? (
                <span className="animate-spin">◌</span>
              ) : (
                STEP_ICONS[state]
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  state === 'completed'
                    ? 'text-gray-500'
                    : state === 'pending'
                    ? 'text-gray-400'
                    : 'text-gray-900'
                }`}
              >
                {step.name}
              </p>
              {step.description && (
                <p className="text-xs text-gray-400 truncate">{step.description}</p>
              )}
              {execution?.actionRequired && state === 'waiting' && (
                <p className="text-xs text-amber-600 mt-0.5">{execution.actionRequired}</p>
              )}
              {execution?.error && (
                <p className="text-xs text-red-600 mt-0.5">{execution.error}</p>
              )}
            </div>

            {/* Step Type Badge */}
            <span className="text-xs text-gray-400 capitalize">{step.type.replace('_', ' ')}</span>
          </div>
        );
      })}
    </div>
  );
};
