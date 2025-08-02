import React from 'react';
import { CheckCircle } from 'lucide-react';
import { WorkflowStep } from '../types';

interface WorkflowNavigationProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}

const steps = [
  { number: 1, name: 'Select Domain', description: 'Choose your domain' },
  { number: 2, name: 'Choose Template', description: 'Pick a template type' },
  { number: 3, name: 'Enter Inputs', description: 'Customize your report' },
  { number: 4, name: 'Connect Data Source', description: 'Select data source' },
  { number: 5, name: 'Generate Document', description: 'Create your report' },
];

export const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  currentStep,
  completedSteps,
}) => {
  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepNumber as WorkflowStep)) {
      return 'completed';
    }
    if (stepNumber === currentStep) {
      return 'current';
    }
    return 'upcoming';
  };

  const getStepClasses = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-primary-600 text-white border-primary-600';
      case 'current':
        return 'bg-primary-600 text-white border-primary-600';
      case 'upcoming':
        return 'bg-gray-200 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-200 text-gray-500 border-gray-200';
    }
  };

  const getConnectorClasses = (stepNumber: number): string => {
    const isCompleted = completedSteps.includes(stepNumber as WorkflowStep);
    
    if (isCompleted || (stepNumber < currentStep)) {
      return 'bg-primary-600';
    }
    return 'bg-gray-200';
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="py-3 xs:py-4 ipad-mini:py-6">
          <nav aria-label="Progress">
            {/* Mobile Layout - Vertical */}
            <div className="block ipad-mini:hidden">
              <div className="space-y-3">
                {steps.map((step) => {
                  const status = getStepStatus(step.number);
                  const isCompleted = status === 'completed';
                  const isCurrent = status === 'current';

                  return (
                    <div key={step.name} className="flex items-center">
                      <div className="relative">
                        <div
                          className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium
                            ${getStepClasses(status)}
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span>{step.number}</span>
                          )}
                        </div>
                        {isCurrent && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent ? 'text-primary-700' : 
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isCurrent || isCompleted ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tablet and Desktop Layout - Horizontal */}
            <ol className="hidden ipad-mini:flex items-center justify-between">
              {steps.map((step, stepIdx) => {
                const status = getStepStatus(step.number);
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';

                return (
                  <li key={step.name} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div className="relative">
                        <div
                          className={`
                            w-8 h-8 ipad:w-10 ipad:h-10 rounded-full border-2 flex items-center justify-center text-xs ipad:text-sm font-medium
                            ${getStepClasses(status)}
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 ipad:w-5 ipad:h-5" />
                          ) : (
                            <span>{step.number}</span>
                          )}
                        </div>
                        {isCurrent && (
                          <div className="absolute -top-0.5 -right-0.5 ipad:-top-1 ipad:-right-1 w-2 h-2 ipad:w-3 ipad:h-3 bg-primary-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="ml-2 ipad:ml-4 min-w-0 flex-1">
                        <p
                          className={`text-xs ipad:text-sm font-medium ${
                            isCurrent ? 'text-primary-700' : 
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.name}
                        </p>
                        <p
                          className={`text-xs hidden ipad:block ${
                            isCurrent || isCompleted ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    {stepIdx < steps.length - 1 && (
                      <div className="flex-1 ml-3 mr-3 ipad:ml-6 ipad:mr-6">
                        <div
                          className={`h-0.5 w-full ${getConnectorClasses(step.number)}`}
                        ></div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
};