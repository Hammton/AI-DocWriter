import { create } from 'zustand';
import type { WorkflowState, Domain, Template, DataSource } from '../types';
import { WorkflowStep } from '../types';

interface WorkflowStore extends WorkflowState {
  completedSteps: WorkflowStep[];
  setCurrentStep: (step: WorkflowStep) => void;
  setSelectedDomain: (domain: Domain) => void;
  setSelectedTemplate: (template: Template) => void;
  setFormData: (data: Record<string, any>) => void;
  setSelectedDataSource: (dataSource: DataSource) => void;
  completeStep: (step: WorkflowStep) => void;
  reset: () => void;
}

const initialState: WorkflowState = {
  currentStep: WorkflowStep.SELECT_DOMAIN,
  formData: {},
  isComplete: false,
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,
  completedSteps: [],
  
  setCurrentStep: (step: WorkflowStep) => {
    set({ currentStep: step });
  },
  
  setSelectedDomain: (domain: Domain) => {
    set({ selectedDomain: domain });
  },
  
  setSelectedTemplate: (template: Template) => {
    set({ selectedTemplate: template });
  },
  
  setFormData: (data: Record<string, any>) => {
    set((state) => ({
      formData: { ...state.formData, ...data }
    }));
  },
  
  setSelectedDataSource: (dataSource: DataSource) => {
    set({ selectedDataSource: dataSource });
  },
  
  completeStep: (step: WorkflowStep) => {
    const { completedSteps } = get();
    if (!completedSteps.includes(step)) {
      set({ 
        completedSteps: [...completedSteps, step].sort((a, b) => a - b)
      });
    }
  },
  
  reset: () => {
    set({
      ...initialState,
      completedSteps: [],
    });
  },
}));