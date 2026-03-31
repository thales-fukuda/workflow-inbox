import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { SimulationPanel } from './components/SimulationPanel';
import { useTaskStore } from './store/taskStore';
import './index.css';

function App() {
  const [showSimPanel, setShowSimPanel] = useState(true);
  const [selectedQueueId, setSelectedQueueId] = useState('my-review');
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header onToggleSimPanel={() => setShowSimPanel(!showSimPanel)} showSimPanel={showSimPanel} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar selectedQueueId={selectedQueueId} onSelectQueue={setSelectedQueueId} />

        {/* Task List */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <TaskList queueId={selectedQueueId} />
        </div>

        {/* Task Detail */}
        <div className="flex-1 bg-gray-50 overflow-auto">
          {selectedTaskId ? (
            <TaskDetail taskId={selectedTaskId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">Select a task to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Panel */}
      {showSimPanel && <SimulationPanel />}
    </div>
  );
}

export default App;
