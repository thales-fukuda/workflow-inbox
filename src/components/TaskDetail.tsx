import { useTaskStore } from '../store/taskStore';
import { WORKFLOWS } from '../data/workflows';
import { WorkflowProgress } from './WorkflowProgress';
import { ReviewForm } from './ReviewForm';
import { ActionForm } from './ActionForm';
import { Icon } from './Icon';
import type { TaskState } from '../types';

interface TaskDetailProps {
  taskId: string;
}

const STATE_LABELS: Record<TaskState, string> = {
  created: 'Created',
  review: 'Needs Review',
  running: 'Running',
  waiting_human: 'Action Required',
  waiting_external: 'Waiting for External System',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const STATE_DESCRIPTIONS: Record<TaskState, string> = {
  created: 'Task has been created and is queued for processing.',
  review: 'Please review the extracted data and approve or make corrections.',
  running: 'Task is currently being processed automatically.',
  waiting_human: 'This task requires your action to continue.',
  waiting_external: 'Waiting for external system to respond.',
  paused: 'Task has been paused and will not continue until resumed.',
  completed: 'Task has been completed successfully.',
  failed: 'Task encountered an error and needs attention.',
  cancelled: 'Task has been cancelled.',
};

export const TaskDetail = ({ taskId }: TaskDetailProps) => {
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId));
  const { approveReview, rejectTask, completeHumanAction, retryTask } = useTaskStore();

  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Task not found</p>
      </div>
    );
  }

  const workflow = WORKFLOWS[task.workflowId];
  const currentStep = workflow?.steps.find((s) => s.id === task.currentStepId);
  const currentStepExecution = task.stepExecutions.find((se) => se.stepId === task.currentStepId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                <Icon name={workflow?.icon || 'document'} size={20} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
            </div>
            <p className="text-sm text-gray-500">
              {workflow?.name} • ID: {task.id}
            </p>
          </div>
          <div className="text-right">
            <span className={`badge badge-${task.state} text-sm px-3 py-1`}>
              {STATE_LABELS[task.state]}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Created {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* State Description */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{STATE_DESCRIPTIONS[task.state]}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="col-span-3 space-y-6">
            {/* Review Form */}
            {task.state === 'review' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-900">Review Data</h2>
                </div>
                <div className="card-body">
                  <ReviewForm task={task} />
                  <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => approveReview(task.id)}
                      className="btn btn-success"
                    >
                      Approve & Continue
                    </button>
                    <button
                      onClick={() => rejectTask(task.id)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Form */}
            {task.state === 'waiting_human' && currentStep && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-900">Action Required</h2>
                </div>
                <div className="card-body">
                  <ActionForm
                    task={task}
                    step={currentStep}
                    stepExecution={currentStepExecution}
                  />
                  <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => completeHumanAction(task.id)}
                      className="btn btn-success"
                    >
                      Complete Action
                    </button>
                    <button
                      onClick={() => rejectTask(task.id)}
                      className="btn btn-secondary"
                    >
                      Cancel Task
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Failed State */}
            {task.state === 'failed' && (
              <div className="card border-red-200">
                <div className="card-header bg-red-50">
                  <h2 className="text-sm font-semibold text-red-900">Task Failed</h2>
                </div>
                <div className="card-body">
                  <p className="text-sm text-gray-600 mb-4">
                    An error occurred while processing this task. You can retry or cancel.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => retryTask(task.id)} className="btn btn-primary">
                      Retry Task
                    </button>
                    <button onClick={() => rejectTask(task.id)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Task Data (readonly for non-review states) */}
            {task.state !== 'review' && task.state !== 'waiting_human' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-900">Task Data</h2>
                </div>
                <div className="card-body">
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(task.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Workflow Progress */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-gray-900">Workflow Progress</h2>
              </div>
              <div className="card-body">
                <WorkflowProgress task={task} />
              </div>
            </div>

            {/* Task Info */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-gray-900">Details</h2>
              </div>
              <div className="card-body space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Triggered By</label>
                  <p className="text-sm font-medium text-gray-900">{task.triggeredBy}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Priority</label>
                  <p className={`text-sm font-medium capitalize priority-${task.priority}`}>
                    {task.priority}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Category</label>
                  <div className="flex gap-1 mt-1">
                    {task.tags.map((tag) => (
                      <span key={tag} className="badge bg-gray-100 text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {task.assignedTo && (
                  <div>
                    <label className="text-xs text-gray-500">Assigned To</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {task.assignedTo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
