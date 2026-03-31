import { WORKFLOWS } from '../data/workflows';
import { Icon } from './Icon';
import type { Task, StepState } from '../types';

interface WorkflowProgressProps {
  task: Task;
}

const STEP_ICONS: Record<StepState, string> = {
  pending: 'circle-empty',
  running: 'circle-dot',
  waiting: 'circle-half',
  completed: 'check',
  failed: 'x-mark',
  skipped: 'minus',
};

export const WorkflowProgress = ({ task }: WorkflowProgressProps) => {
  const workflow = WORKFLOWS[task.workflowId];

  if (!workflow) {
    return <p className="text-sm text-gray-500">Workflow not found</p>;
  }

  return (
    <div className="space-y-0.5">
      {workflow.steps.map((step) => {
        const execution = task.stepExecutions.find((se) => se.stepId === step.id);
        const state = execution?.state || 'pending';
        const isCurrent = task.currentStepId === step.id;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-2 py-1.5 px-2 rounded ${
              isCurrent ? 'bg-blue-50' : ''
            }`}
          >
            {/* Step Indicator */}
            <div className={`step-indicator step-${state} flex-shrink-0`}>
              {state === 'running' ? (
                <Icon name="refresh" size={12} className="animate-spin" />
              ) : (
                <Icon name={STEP_ICONS[state]} size={12} />
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  state === 'completed'
                    ? 'text-gray-400'
                    : state === 'pending'
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
              >
                {step.name}
              </p>
              {execution?.actionRequired && state === 'waiting' && (
                <p className="text-xs text-amber-600 truncate">{execution.actionRequired}</p>
              )}
              {execution?.error && (
                <p className="text-xs text-red-600 truncate">{execution.error}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
