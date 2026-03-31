import { useState } from 'react';
import type { WorkflowInstance, Task, LineItem } from '../types';
import type { TranslationKey } from '../i18n/translations';
import { formatCurrency } from '../utils/formatTime';
import { useLanguage } from '../i18n/LanguageContext';
import { useWorkflowStore } from '../store/workflowStore';
import { EanSearchModal } from './EanSearchModal';

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

const EanStatusBadge = ({ status, ean }: { status: LineItem['eanStatus']; ean: string | null }) => {
  if (status === 'resolved' && ean) {
    return (
      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded font-mono">
        {ean}
      </span>
    );
  }
  if (status === 'manual' && ean) {
    return (
      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded font-mono">
        {ean}
      </span>
    );
  }
  if (status === 'suggested') {
    return (
      <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded animate-pulse-subtle">
        SUGGESTED
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
      NO EAN
    </span>
  );
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
  const { updateExtractedData, updateLineItem, resolveEan } = useWorkflowStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState(extractedData?.supplier || '');
  const [editedInvoiceNumber, setEditedInvoiceNumber] = useState(extractedData?.invoiceNumber || '');
  const [editedDate, setEditedDate] = useState(extractedData?.date || '');
  const [eanModalItem, setEanModalItem] = useState<LineItem | null>(null);

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

  const handleSaveEdits = () => {
    updateExtractedData(workflow.id, {
      supplier: editedSupplier,
      invoiceNumber: editedInvoiceNumber,
      date: editedDate,
    });
    setIsEditing(false);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateLineItem(workflow.id, itemId, { quantity: Math.max(1, quantity) });
  };

  const handlePriceChange = (itemId: string, unitPrice: number) => {
    updateLineItem(workflow.id, itemId, { unitPrice: Math.max(0, unitPrice) });
  };

  const handleEanSelect = (ean: string, productName?: string) => {
    if (eanModalItem) {
      resolveEan(workflow.id, eanModalItem.id, ean, productName);
    }
    setEanModalItem(null);
  };

  const hasUnresolvedEans = extractedData?.lineItems.some(item => item.eanStatus === 'unknown');
  const canApprove = status === 'pending_approval' && !hasUnresolvedEans;

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
                disabled={!canApprove}
                className={`px-4 py-2 font-medium rounded-lg transition-all duration-200 btn-press ${
                  canApprove
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                {t('approve')}
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-all duration-200 btn-press"
              >
                {t('reject')}
              </button>
              {hasUnresolvedEans && (
                <span className="text-sm text-amber-600 dark:text-amber-400 ml-2">
                  {t('resolveEansFirst')}
                </span>
              )}
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t('extractedData')}
              </h3>
              {status === 'pending_approval' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isEditing ? t('cancel') : t('edit')}
                </button>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3 transition-colors duration-200">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">{t('supplier')}</label>
                    <input
                      type="text"
                      value={editedSupplier}
                      onChange={(e) => setEditedSupplier(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">{t('invoiceNumber')}</label>
                    <input
                      type="text"
                      value={editedInvoiceNumber}
                      onChange={(e) => setEditedInvoiceNumber(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">{t('date')}</label>
                    <input
                      type="date"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSaveEdits}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      {t('save')}
                    </button>
                  </div>
                </div>
              ) : (
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
              )}

              <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('lineItems')}</p>
                <div className="space-y-2">
                  {extractedData.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm py-2 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-600/50 rounded px-2 -mx-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-slate-900 dark:text-slate-100 truncate">{item.name}</span>
                        <EanStatusBadge status={item.eanStatus} ean={item.ean} />
                        {item.isNewProduct && (
                          <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                            NEW
                          </span>
                        )}
                        {item.isEdited && (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                            {t('edited')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        {status === 'pending_approval' ? (
                          <>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                              min="1"
                            />
                            <span>×</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                              min="0"
                              step="0.01"
                            />
                            {item.eanStatus === 'unknown' && (
                              <button
                                onClick={() => setEanModalItem(item)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded transition-colors"
                              >
                                {t('resolveEan')}
                              </button>
                            )}
                          </>
                        ) : (
                          <span>
                            {item.quantity} × {formatCurrency(item.unitPrice, extractedData.currency)}
                          </span>
                        )}
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

      {/* EAN Search Modal */}
      {eanModalItem && (
        <EanSearchModal
          isOpen={true}
          onClose={() => setEanModalItem(null)}
          onSelect={handleEanSelect}
          productName={eanModalItem.name}
          supplierCode={eanModalItem.supplierCode}
        />
      )}
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
