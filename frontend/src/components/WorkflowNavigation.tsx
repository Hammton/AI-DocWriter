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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
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
                            w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                            ${getStepClasses(status)}
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span>{step.number}</span>
                          )}
                        </div>
                        {isCurrent && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
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
                    
                    {stepIdx < steps.length - 1 && (
                      <div className="flex-1 ml-6 mr-6">
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