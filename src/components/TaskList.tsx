import { useTaskStore } from '../store/taskStore';
import { useRoleStore } from '../store/roleStore';
import { QUEUES } from '../data/queues';
import { WORKFLOWS } from '../data/workflows';
import { Icon } from './Icon';
import type { Task, TaskState } from '../types';

interface TaskListProps {
  queueId: string;
}

const STATE_LABELS: Record<TaskState, string> = {
  created: 'Created',
  review: 'Needs Review',
  running: 'Running',
  waiting_human: 'Action Required',
  waiting_external: 'Processing',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const TaskList = ({ queueId }: TaskListProps) => {
  const currentRole = useRoleStore((s) => s.currentRole);
  const { selectedTaskId, selectTask, getTasksForQueue } = useTaskStore();

  const queue = QUEUES.find((q) => q.id === queueId);
  if (!queue) return null;

  const tasks = getTasksForQueue(queue, currentRole);

  // Sort by date, newest first
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Icon name={queue.icon} size={16} />
            {queue.name}
          </h2>
          <span className="text-xs text-gray-500">{tasks.length} tasks</span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-sm">No tasks in this queue</p>
          </div>
        ) : (
          <div>
            {sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isSelected={task.id === selectedTaskId}
                onSelect={() => selectTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
}

const TaskRow = ({ task, isSelected, onSelect }: TaskRowProps) => {
  const workflow = WORKFLOWS[task.workflowId];

  return (
    <div
      onClick={onSelect}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-gray-50'
      }`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon name={workflow?.icon || 'document'} size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {task.title}
          </span>
        </div>
        <span className={`badge badge-${task.state}`}>{STATE_LABELS[task.state]}</span>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{workflow?.name || task.workflowId}</span>
        <span>{formatTime(task.createdAt)}</span>
      </div>

      {/* Priority indicator for urgent/high */}
      {(task.priority === 'urgent' || task.priority === 'high') && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className={`priority-${task.priority}`}>●</span>
          <span className={`text-xs capitalize priority-${task.priority}`}>{task.priority}</span>
        </div>
      )}
    </div>
  );
};
