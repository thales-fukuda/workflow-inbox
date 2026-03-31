import type { WorkflowInstance } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface WorkflowCardProps {
  workflow: WorkflowInstance;
  onSelect: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const StatusBadge = ({ status }: { status: WorkflowInstance['status'] }) => {
  const { t } = useLanguage();

  const styles = {
    pending_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const labels = {
    pending_approval: t('pending'),
    approved: t('approved'),
    running: t('running'),
    completed: t('completed'),
    failed: t('failed'),
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${styles[status]} ${status === 'running' ? 'animate-pulse-subtle' : ''}`}>
      {labels[status]}
    </span>
  );
};

export const WorkflowCard = ({
  workflow,
  onSelect,
  onApprove,
  onReject,
  onRetry,
  onDismiss,
}: WorkflowCardProps) => {
  const { t } = useLanguage();
  const { extractedData, status, tasks, createdAt } = workflow;

  const newSkuCount = extractedData?.lineItems.filter(i => i.isNewSku).length || 0;
  const lineItemCount = extractedData?.lineItems.length || 0;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const currentTask = tasks.find(t => t.status === 'running');
  const failedTask = tasks.find(t => t.status === 'failed');

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t('justNow');
    if (diffMin < 60) return `${diffMin}${t('minutesAgo')}`;
    if (diffHour < 24) return `${diffHour}${t('hoursAgo')}`;
    return `${diffDay}${t('daysAgo')}`;
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 card-hover cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
            <span className="text-lg">📨</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {t('invoiceProcessing')}
              </h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {extractedData?.supplier} • {lineItemCount} {t('items')}
              {newSkuCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400"> • {newSkuCount} {newSkuCount > 1 ? t('newSkus') : t('newSku')}</span>
              )}
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {formatTime(createdAt)}
        </span>
      </div>

      {/* Progress for running workflows */}
      {status === 'running' && (
        <div className="mt-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">
              {currentTask?.name || t('processing')}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full progress-bar relative overflow-hidden"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Error message for failed workflows */}
      {status === 'failed' && failedTask && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400 animate-fade-in">
          {failedTask.name}: {failedTask.error}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        {status === 'pending_approval' && (
          <>
            <button
              onClick={onApprove}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-all duration-200 btn-press hover:shadow-md"
            >
              {t('approve')}
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-all duration-200 btn-press"
            >
              {t('reject')}
            </button>
          </>
        )}
        {status === 'failed' && (
          <>
            <button
              onClick={onRetry}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-all duration-200 btn-press hover:shadow-md"
            >
              {t('retry')}
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-all duration-200 btn-press"
            >
              {t('dismiss')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
