import { useRoleStore } from '../store/roleStore';
import { useTaskStore } from '../store/taskStore';
import { getQueuesForRole } from '../data/queues';

interface SidebarProps {
  selectedQueueId: string;
  onSelectQueue: (queueId: string) => void;
}

export const Sidebar = ({ selectedQueueId, onSelectQueue }: SidebarProps) => {
  const currentRole = useRoleStore((s) => s.currentRole);
  const { tasks, getTasksForQueue } = useTaskStore();
  const queues = getQueuesForRole(currentRole);

  // Group queues
  const actionQueues = queues.filter((q) => ['my-review', 'my-actions'].includes(q.id));
  const statusQueues = queues.filter((q) => ['in-progress', 'completed', 'failed'].includes(q.id));
  const otherQueues = queues.filter((q) => !actionQueues.includes(q) && !statusQueues.includes(q));

  const QueueItem = ({ queue }: { queue: typeof queues[0] }) => {
    const count = getTasksForQueue(queue, currentRole).length;
    const isActive = selectedQueueId === queue.id;
    const isActionQueue = ['my-review', 'my-actions'].includes(queue.id);

    return (
      <button
        onClick={() => onSelectQueue(queue.id)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className="flex items-center gap-2">
          <span>{queue.icon}</span>
          <span className="font-medium">{queue.name}</span>
        </span>
        {count > 0 && (
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : isActionQueue && count > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Queues */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Action Queues */}
        {actionQueues.length > 0 && (
          <div className="mb-4">
            <h3 className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Action Required
            </h3>
            <div className="space-y-0.5">
              {actionQueues.map((queue) => (
                <QueueItem key={queue.id} queue={queue} />
              ))}
            </div>
          </div>
        )}

        {/* Status Queues */}
        {statusQueues.length > 0 && (
          <div className="mb-4">
            <h3 className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </h3>
            <div className="space-y-0.5">
              {statusQueues.map((queue) => (
                <QueueItem key={queue.id} queue={queue} />
              ))}
            </div>
          </div>
        )}

        {/* Other Queues */}
        {otherQueues.length > 0 && (
          <div>
            <h3 className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Views
            </h3>
            <div className="space-y-0.5">
              {otherQueues.map((queue) => (
                <QueueItem key={queue.id} queue={queue} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Total Tasks</span>
            <span className="font-medium text-gray-700">{tasks.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Action</span>
            <span className="font-medium text-amber-600">
              {tasks.filter((t) => t.state === 'review' || t.state === 'waiting_human').length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
