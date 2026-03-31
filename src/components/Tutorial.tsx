import { useState } from 'react';
import { Icon } from './Icon';

const TUTORIAL_KEY = 'globglob-tutorial-seen';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome to GlobGlob',
    description: 'This is a workflow automation platform with human-in-the-loop review. Tasks flow through configurable steps, pausing for human input when needed.',
    icon: 'play',
  },
  {
    title: 'Create Test Tasks',
    description: 'Click the gear icon in the bottom-right corner to open the Simulation Panel. Use it to create sample Invoice or Purchase Request tasks.',
    icon: 'cog',
  },
  {
    title: 'Review & Approve',
    description: 'New tasks appear in "My Review" queue. Click a task to see its details, edit the extracted data, then approve or reject it.',
    icon: 'clipboard',
  },
  {
    title: 'Watch Workflows Run',
    description: 'After approval, tasks move through automated steps. The progress panel shows each step\'s status. Some steps pause for human action.',
    icon: 'refresh',
  },
  {
    title: 'Handle External Systems',
    description: 'When tasks wait for external systems (like ERP), use the Simulation Panel to simulate success or failure responses.',
    icon: 'bolt',
  },
  {
    title: 'Switch Roles',
    description: 'Use the role dropdown in the header to switch between Admin, Reviewer, Finance, and Operations. Each role sees different queues and actions.',
    icon: 'arrow-right',
  },
];

export const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    return !seen;
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold text-gray-900">Quick Start Guide</span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="x-mark" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Icon name={step.icon} size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Step {currentStep + 1} of {steps.length}</p>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tutorial
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TutorialButton = () => {
  const handleOpen = () => {
    localStorage.removeItem(TUTORIAL_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={handleOpen}
      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
      title="Show tutorial"
    >
      <Icon name="question-mark-circle" size={18} />
    </button>
  );
};
