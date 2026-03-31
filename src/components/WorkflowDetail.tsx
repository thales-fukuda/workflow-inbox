import type { WorkflowInstance, Task } from '../types';
import type { TranslationKey } from '../i18n/translations';
import { formatCurrency } from '../utils/formatTime';
import { useLanguage } from '../i18n/LanguageContext';

interface WorkflowDetailProps {
  workflow: WorkflowInstance;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

const TaskStatusIcon = ({ status }: { status: Task['status'] }) => {
  switch (status) {
    case 'completed':
      return <span className="text-green-500 transition-all duration-300">✓</span>;
    case 'running':
      return <span className="text-blue-500 animate-pulse">●</span>;
    case 'failed':
      return <span className="text-red-500">✗</span>;
    case 'pending':
      return <span className="text-slate-300 dark:text-slate-600">○</span>;
    default:
      return <span className="text-slate-300">○</span>;
  }
};

export const WorkflowDetail = ({
  workflow,
  onBack,
  onApprove,
  onReject,
  onRetry,
  onDismiss,
}: WorkflowDetailProps) => {
  const { t } = useLanguage();
  const { extractedData, event, status, tasks } = workflow;

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
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 mb-3 transition-colors duration-200 btn-press"
        >
          ← {t('back')}
        </button>
        <div className="flex items-start justify-between">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📨</span>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {t('invoiceProcessing')}
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {extractedData?.invoiceNumber} • {extractedData?.supplier}
            </p>
          </div>
          <StatusBadgeLarge status={status} t={t} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {status === 'pending_approval' && (
            <>
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 btn-press hover:shadow-lg hover:shadow-indigo-500/25"
              >
                {t('approve')}
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-all duration-200 btn-press"
              >
                {t('reject')}
              </button>
            </>
          )}
          {status === 'failed' && (
            <>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 btn-press hover:shadow-lg hover:shadow-indigo-500/25"
              >
                {t('retry')}
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-all duration-200 btn-press"
              >
                {t('dismiss')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Trigger */}
        <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {t('trigger')}
          </h3>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 transition-colors duration-200">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t('emailFrom')} <span className="font-medium">{event.source}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {event.subject}
            </p>
            {event.attachment && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                📎 {event.attachment}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {t('received')} {formatTime(event.receivedAt)}
            </p>
          </div>
        </section>

        {/* Extracted Data */}
        {extractedData && (
          <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              {t('extractedData')}
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3 transition-colors duration-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t('supplier')}</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{extractedData.supplier}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t('invoiceNumber')}</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{extractedData.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t('date')}</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{extractedData.date}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t('total')}</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(extractedData.total, extractedData.currency)}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('lineItems')}</p>
                <div className="space-y-2">
                  {extractedData.lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm py-1 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-600/50 rounded px-2 -mx-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 dark:text-slate-100">{item.name}</span>
                        {item.isNewSku ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded animate-pulse-subtle">
                            NEW SKU
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">
                            {item.sku}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {item.quantity} × {formatCurrency(item.unitPrice, extractedData.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Planned Actions / Progress */}
        <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {status === 'pending_approval' ? t('plannedActions') : t('progress')}
          </h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                  task.status === 'running'
                    ? 'bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                    : task.status === 'failed'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : task.status === 'completed'
                    ? 'bg-green-50/50 dark:bg-green-900/10'
                    : 'bg-slate-50 dark:bg-slate-700/50'
                }`}
              >
                <div className="mt-0.5">
                  <TaskStatusIcon status={task.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors duration-200 ${
                    task.status === 'completed'
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {task.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {task.description}
                  </p>
                  {task.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 animate-fade-in">
                      {t('error')}: {task.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatusBadgeLarge = ({ status, t }: { status: WorkflowInstance['status']; t: (key: TranslationKey) => string }) => {
  const styles = {
    pending_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const labels = {
    pending_approval: t('pendingApproval'),
    approved: t('approved'),
    running: t('running'),
    completed: t('completed'),
    failed: t('failed'),
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${styles[status]} ${status === 'running' ? 'animate-pulse-subtle' : ''}`}>
      {labels[status]}
    </span>
  );
};
