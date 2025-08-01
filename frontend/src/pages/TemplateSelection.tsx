import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Target, BarChart3 } from 'lucide-react';
import type { Template } from '../types';
import { TemplateType, WorkflowStep } from '../types';
import { useWorkflowStore } from '../stores/workflowStore';

const templates: Template[] = [
  {
    id: 'application_profile',
    type: TemplateType.APPLICATION_PROFILE,
    name: 'Application Profile Report',
    description: 'Comprehensive application architecture documentation',
    avgPages: 12,
    icon: 'FileText',
    placeholders: ['{application_name}', '{description}', '{owner}'],
    requiredFields: ['applicationName', 'description', 'owner'],
  },
  {
    id: 'business_profile',
    type: TemplateType.BUSINESS_PROFILE,
    name: 'Business Profile Report',
    description: 'Comprehensive business division profile covering structure, capabilities, and cost analysis',
    avgPages: 7,
    icon: 'Target',
    placeholders: ['{executive_summary}', '{key_findings}', '{recommendations}'],
    requiredFields: ['executiveSummary', 'keyFindings'],
  },
  {
    id: 'demand_profile',
    type: TemplateType.DEMAND_ARCHITECTURE,
    name: 'Demand Architecture Profile Report',
    description: 'Assessment of incoming demands to determine architectural feasibility, business impact and change implications',
    avgPages: 10,
    icon: 'BarChart3',
    placeholders: ['{technical_details}', '{analysis}', '{metrics}'],
    requiredFields: ['technicalDetails', 'analysis', 'metrics'],
  },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  FileText,
  Target,
  BarChart3,
};

export const TemplateSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectedDomain, setSelectedTemplate, setCurrentStep, completeStep } = useWorkflowStore();

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    completeStep(WorkflowStep.CHOOSE_TEMPLATE);
    setCurrentStep(WorkflowStep.ENTER_INPUTS);
    navigate('/input-form');
  };

  const handleBack = () => {
    setCurrentStep(WorkflowStep.SELECT_DOMAIN);
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Select a Report Template
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Based on your domain: <span className="font-medium text-primary-600">{selectedDomain?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
        {templates.map((template) => {
          const IconComponent = iconMap[template.icon];
          
          return (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-300 group"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <IconComponent className="w-8 h-8 text-teal-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                
                <p className="text-xs font-medium text-teal-600 mb-3">
                  Avg. {template.avgPages} pages
                </p>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
    </div>
  );
};