import { useWorkflowStore } from './store/workflowStore';
import { Inbox } from './components/Inbox';
import { WorkflowDetail } from './components/WorkflowDetail';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import './index.css';

function AppContent() {
  const { t } = useLanguage();
  const {
    workflows,
    selectedWorkflowId,
    selectWorkflow,
    simulateInvoiceEmail,
    createWorkflowFromInvoice,
    approveWorkflow,
    rejectWorkflow,
    retryWorkflow,
    dismissWorkflow,
  } = useWorkflowStore();

  const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Sidebar / Main List */}
      <div
        className={`${
          selectedWorkflow ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-[400px] lg:w-[480px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300`}
      >
        <Inbox
          workflows={workflows}
          onSelectWorkflow={selectWorkflow}
          onApproveWorkflow={approveWorkflow}
          onRejectWorkflow={rejectWorkflow}
          onRetryWorkflow={retryWorkflow}
          onDismissWorkflow={dismissWorkflow}
          onSimulateEmail={simulateInvoiceEmail}
          onCreateFromInvoice={createWorkflowFromInvoice}
        />
      </div>

      {/* Detail Panel */}
      <div className="flex-1 hidden md:block p-4">
        {selectedWorkflow ? (
          <WorkflowDetail
            key={selectedWorkflow.id}
            workflow={selectedWorkflow}
            onBack={() => selectWorkflow(null)}
            onApprove={() => approveWorkflow(selectedWorkflow.id)}
            onReject={() => rejectWorkflow(selectedWorkflow.id)}
            onRetry={() => retryWorkflow(selectedWorkflow.id)}
            onDismiss={() => dismissWorkflow(selectedWorkflow.id)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <div className="text-center animate-fade-in">
              <div className="text-5xl mb-3">📋</div>
              <p>{t('selectWorkflowToView')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Detail View */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-white dark:bg-slate-800 md:hidden z-50 animate-slide-in-right">
          <WorkflowDetail
            workflow={selectedWorkflow}
            onBack={() => selectWorkflow(null)}
            onApprove={() => approveWorkflow(selectedWorkflow.id)}
            onReject={() => rejectWorkflow(selectedWorkflow.id)}
            onRetry={() => retryWorkflow(selectedWorkflow.id)}
            onDismiss={() => dismissWorkflow(selectedWorkflow.id)}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
