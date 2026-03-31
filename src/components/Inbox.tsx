import { useState } from 'react';
import type { WorkflowInstance, InvoiceData } from '../types';
import { WorkflowCard } from './WorkflowCard';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UploadModal } from './UploadModal';
import { useLanguage } from '../i18n/LanguageContext';

interface InboxProps {
  workflows: WorkflowInstance[];
  onSelectWorkflow: (id: string) => void;
  onApproveWorkflow: (id: string) => void;
  onRejectWorkflow: (id: string) => void;
  onRetryWorkflow: (id: string) => void;
  onDismissWorkflow: (id: string) => void;
  onSimulateEmail: () => void;
  onCreateFromInvoice: (data: InvoiceData, fileName: string) => void;
}

export const Inbox = ({
  workflows,
  onSelectWorkflow,
  onApproveWorkflow,
  onRejectWorkflow,
  onRetryWorkflow,
  onDismissWorkflow,
  onSimulateEmail,
  onCreateFromInvoice,
}: InboxProps) => {
  const { t } = useLanguage();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const pending = workflows.filter(w => w.status === 'pending_approval');
  const running = workflows.filter(w => w.status === 'running');
  const failed = workflows.filter(w => w.status === 'failed');
  const completed = workflows.filter(w => w.status === 'completed');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t('workflows')}
          </h1>
          <LanguageSwitcher />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSimulateEmail}
            className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 btn-press"
          >
            <span>🎲</span>
            {t('simulateInvoiceEmail')}
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 btn-press hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <span>📄</span>
            {t('uploadInvoice')}
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onExtracted={onCreateFromInvoice}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {workflows.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="text-5xl mb-4 animate-bounce-subtle">📭</div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
              {t('noWorkflowsYet')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[250px] mx-auto">
              {t('clickSimulateToCreate')}
            </p>
          </div>
        ) : (
          <>
            {/* Pending Approval */}
            {pending.length > 0 && (
              <Section
                title={t('pendingApproval')}
                count={pending.length}
                color="amber"
              >
                {pending.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onSelect={() => onSelectWorkflow(workflow.id)}
                    onApprove={() => onApproveWorkflow(workflow.id)}
                    onReject={() => onRejectWorkflow(workflow.id)}
                  />
                ))}
              </Section>
            )}

            {/* Running */}
            {running.length > 0 && (
              <Section title={t('running')} count={running.length} color="blue">
                {running.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onSelect={() => onSelectWorkflow(workflow.id)}
                  />
                ))}
              </Section>
            )}

            {/* Needs Attention (Failed) */}
            {failed.length > 0 && (
              <Section
                title={t('needsAttention')}
                count={failed.length}
                color="red"
              >
                {failed.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onSelect={() => onSelectWorkflow(workflow.id)}
                    onRetry={() => onRetryWorkflow(workflow.id)}
                    onDismiss={() => onDismissWorkflow(workflow.id)}
                  />
                ))}
              </Section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <Section
                title={t('completedToday')}
                count={completed.length}
                color="green"
              >
                {completed.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onSelect={() => onSelectWorkflow(workflow.id)}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  count: number;
  color: 'amber' | 'blue' | 'red' | 'green';
  children: React.ReactNode;
}

const Section = ({ title, count, color, children }: SectionProps) => {
  const colorStyles = {
    amber: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    green: 'text-green-600 dark:text-green-400',
  };

  const bgStyles = {
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <h2 className={`text-sm font-medium ${colorStyles[color]}`}>{title}</h2>
        <span
          className={`px-1.5 py-0.5 text-xs font-medium rounded transition-all duration-300 ${bgStyles[color]} ${colorStyles[color]}`}
        >
          {count}
        </span>
      </div>
      <div className="space-y-3 stagger-children">{children}</div>
    </div>
  );
};
