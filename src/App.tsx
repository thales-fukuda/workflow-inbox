import { useState } from 'react';
import { useWorkflowStore } from './store/workflowStore';
import { Inbox } from './components/Inbox';
import { WorkflowDetail } from './components/WorkflowDetail';
import { ProductCatalog } from './components/ProductCatalog';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import './index.css';

type View = 'workflows' | 'products';

function AppContent() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<View>('workflows');
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
  const pendingCount = workflows.filter(w => w.status === 'pending_approval').length;

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setCurrentView('workflows'); selectWorkflow(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'workflows'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('workflows')}
              {pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setCurrentView('products'); selectWorkflow(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'products'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('productCatalog')}
            </button>
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            GlobGlob
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {currentView === 'products' ? (
          <div className="flex-1 p-4">
            <ProductCatalog />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
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
