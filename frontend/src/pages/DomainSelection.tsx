import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Settings, Monitor, Palette, Rocket } from 'lucide-react';
import type { Domain } from '../types';
import { DomainType, WorkflowStep } from '../types';
import { useWorkflowStore } from '../stores/workflowStore';

const domains: Domain[] = [
  {
    id: '1',
    type: DomainType.LIFECYCLE_PROJ,
    name: 'Lifecycle (Proj)',
    description: 'Project lifecycle management and reporting for enterprise initiatives',
    icon: 'FileText',
  },
  {
    id: '2',
    type: DomainType.LIFECYCLE_ALM,
    name: 'Lifecycle (ALM)',
    description: 'Application lifecycle management for software development projects',
    icon: 'Settings',
  },
  {
    id: '3',
    type: DomainType.LIFECYCLE_APM,
    name: 'Lifecycle (APM)',
    description: 'Application performance monitoring and optimization reporting',
    icon: 'Monitor',
  },
  {
    id: '4',
    type: DomainType.LIFECYCLE_DT_DESIGN,
    name: 'Lifecycle (DT 2.0 Design)',
    description: 'Digital twin design-phase reporting and documentation',
    icon: 'Palette',
  },
  {
    id: '5',
    type: DomainType.LIFECYCLE_DT_DEPLOY,
    name: 'Lifecycle (DT 2.0 Deploy)',
    description: 'Digital twin deployment and implementation reporting',
    icon: 'Rocket',
  },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  FileText,
  Settings,
  Monitor,
  Palette,
  Rocket,
};

export const DomainSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedDomain, setCurrentStep, completeStep } = useWorkflowStore();

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(domain);
    completeStep(WorkflowStep.SELECT_DOMAIN);
    setCurrentStep(WorkflowStep.CHOOSE_TEMPLATE);
    navigate('/template-selection');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Domain
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Select the domain that best fits your reporting needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {domains.map((domain) => {
          const IconComponent = iconMap[domain.icon];
          
          return (
            <div
              key={domain.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-300 group"
              onClick={() => handleDomainSelect(domain)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <IconComponent className="w-8 h-8 text-primary-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {domain.name}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {domain.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};