import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Upload, X } from 'lucide-react';
import { WorkflowStep } from '../types';
import { useWorkflowStore } from '../stores/workflowStore';

export const InputForm: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTemplate, formData, setFormData, setCurrentStep, completeStep } = useWorkflowStore();
  
  // Auto-populate document title based on selected template
  const getDefaultTitle = () => {
    if (selectedTemplate) {
      return selectedTemplate.name;
    }
    return 'Report - 2025';
  };
  
  const [localFormData, setLocalFormData] = useState({
    documentTitle: formData.documentTitle || getDefaultTitle(),
    startDate: formData.startDate || '',
    endDate: formData.endDate || '',
    estimatedLength: formData.estimatedLength || 15,
    includeExecutiveSummary: formData.includeExecutiveSummary ?? true,
    useDefaultLogo: formData.useDefaultLogo ?? true,
    customLogo: formData.customLogo || null,
    stakeholderAudience: formData.stakeholderAudience || ['Technical', 'Business'],
    specialInstructions: formData.specialInstructions || '',
  });

  // Update document title when template changes
  useEffect(() => {
    if (selectedTemplate && !formData.documentTitle) {
      setLocalFormData(prev => ({
        ...prev,
        documentTitle: selectedTemplate.name
      }));
    }
  }, [selectedTemplate, formData.documentTitle]);

  const handleInputChange = (field: string, value: any) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStakeholderToggle = (audience: string) => {
    const current = localFormData.stakeholderAudience;
    const updated = current.includes(audience)
      ? current.filter((a: string) => a !== audience)
      : [...current, audience];
    
    setLocalFormData(prev => ({
      ...prev,
      stakeholderAudience: updated
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLocalFormData(prev => ({
            ...prev,
            customLogo: {
              file,
              preview: e.target?.result as string,
              name: file.name
            }
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file (PNG, JPG, etc.)');
      }
    }
  };

  const handleRemoveCustomLogo = () => {
    setLocalFormData(prev => ({
      ...prev,
      customLogo: null,
      useDefaultLogo: true
    }));
  };

  const handleContinue = () => {
    setFormData(localFormData);
    completeStep(WorkflowStep.ENTER_INPUTS);
    setCurrentStep(WorkflowStep.CONNECT_DATA_SOURCE);
    navigate('/data-source');
  };

  const handleBack = () => {
    setCurrentStep(WorkflowStep.CHOOSE_TEMPLATE);
    navigate('/template-selection');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8 ipad-mini:py-12">
      <div className="text-center mb-8 xs:mb-10 ipad-mini:mb-12">
        <h1 className="text-2xl xs:text-3xl font-bold text-gray-900 mb-3 xs:mb-4">
          Customize Your Report
        </h1>
        <p className="text-base xs:text-lg text-gray-600 px-2">
          Fill in details for the {selectedTemplate?.name}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xs:p-6 ipad-mini:p-8">
        <div className="space-y-6 xs:space-y-8">
          {/* Document Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title
            </label>
            <input
              type="text"
              value={localFormData.documentTitle}
              onChange={(e) => handleInputChange('documentTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm xs:text-base"
              placeholder="Enter document title"
            />
          </div>

          {/* Reporting Period */}
          <div>
            <h3 className="text-base xs:text-lg font-medium text-gray-900 mb-3 xs:mb-4">Reporting Period</h3>
            <div className="grid grid-cols-1 ipad-mini:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={localFormData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={localFormData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Length
            </label>
            <div className="relative">
              <input
                type="number"
                value={localFormData.estimatedLength}
                onChange={(e) => handleInputChange('estimatedLength', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="100"
              />
              <span className="ml-2 text-sm text-gray-500">pages</span>
            </div>
          </div>

          {/* Include Executive Summary */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localFormData.includeExecutiveSummary}
                onChange={(e) => handleInputChange('includeExecutiveSummary', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Include Executive Summary?
              </span>
            </label>
            <span className="text-xs text-gray-500">Adds a high-level overview section</span>
          </div>

          {/* Logo */}
          <div>
            <h3 className="text-base xs:text-lg font-medium text-gray-900 mb-3 xs:mb-4">Logo</h3>
            
            {/* Logo Options */}
            <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-6 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="logo"
                  checked={localFormData.useDefaultLogo}
                  onChange={() => handleInputChange('useDefaultLogo', true)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Use DQ default logo</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="logo"
                  checked={!localFormData.useDefaultLogo}
                  onChange={() => handleInputChange('useDefaultLogo', false)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Custom</span>
              </label>
            </div>

            {/* Logo Preview */}
            <div className="flex items-center space-x-4">
              {/* DQ Logo Preview */}
              {localFormData.useDefaultLogo && (
                <div className="flex items-center space-x-3">
                  <img 
                    src="/dq-logo.png" 
                    alt="DQ Logo" 
                    className="h-12 w-auto"
                  />
                  <span className="text-sm text-gray-600">DQ Logo</span>
                </div>
              )}

              {/* Custom Logo Section */}
              {!localFormData.useDefaultLogo && (
                <div className="flex items-center space-x-4">
                  {localFormData.customLogo ? (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={localFormData.customLogo.preview} 
                        alt="Custom Logo" 
                        className="h-12 w-auto border border-gray-200 rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">{localFormData.customLogo.name}</span>
                        <button
                          type="button"
                          onClick={handleRemoveCustomLogo}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer">
                        <div className="w-24 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="flex flex-col">
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Upload logo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stakeholder Audience */}
          <div>
            <h3 className="text-base xs:text-lg font-medium text-gray-900 mb-3 xs:mb-4">Stakeholder Audience</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
              {['Technical', 'Business', 'Executive', 'Operations'].map((audience) => (
                <label key={audience} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFormData.stakeholderAudience.includes(audience)}
                    onChange={() => handleStakeholderToggle(audience)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{audience}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={localFormData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm xs:text-base"
              placeholder="Any focus areas or key messages? (Optional)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col xs:flex-row justify-between gap-3 xs:gap-0 mt-6 xs:mt-8 pt-4 xs:pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <button
            onClick={handleContinue}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-95 transition-transform"
          >
            Continue to Generate
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};