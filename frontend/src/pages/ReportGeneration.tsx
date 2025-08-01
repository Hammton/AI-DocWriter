import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2, Eye } from 'lucide-react';
import { WorkflowStep, GenerationStatus } from '../types';
import { useWorkflowStore } from '../stores/workflowStore';

export const ReportGeneration: React.FC = () => {
  const navigate = useNavigate();
  const { selectedDomain, selectedTemplate, selectedDataSource, formData, setCurrentStep } = useWorkflowStore();
  
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setError('');
      } else {
        setError('Please select a CSV file');
        setCsvFile(null);
      }
    }
  };

  const handleStartGeneration = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    try {
      setGenerationStatus(GenerationStatus.PREPARING);
      setProgress(10);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('csvFile', csvFile);
      formDataToSend.append('templateId', selectedTemplate.id);
      formDataToSend.append('stakeholderAudience', JSON.stringify(formData.stakeholderAudience || ['Technical', 'Business']));

      setGenerationStatus(GenerationStatus.GENERATING);
      setProgress(30);

      const response = await fetch('/api/generate-reports', {
        method: 'POST',
        body: formDataToSend,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate reports');
      }

      const result = await response.json();
      
      setGenerationStatus(GenerationStatus.PROCESSING);
      setProgress(90);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGenerationStatus(GenerationStatus.COMPLETED);
      setProgress(100);
      setSessionId(result.sessionId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate reports');
      setGenerationStatus(GenerationStatus.IDLE);
      setProgress(0);
    }
  };

  const handleBack = () => {
    setCurrentStep(WorkflowStep.CONNECT_DATA_SOURCE);
    navigate('/data-source');
  };

  const handleViewReports = () => {
    if (sessionId) {
      navigate(`/reports/${sessionId}`);
    }
  };

  const getStatusMessage = () => {
    switch (generationStatus) {
      case GenerationStatus.PREPARING:
        return 'Preparing your report...';
      case GenerationStatus.GENERATING:
        return 'Generating content with AI...';
      case GenerationStatus.PROCESSING:
        return 'Processing and formatting...';
      case GenerationStatus.COMPLETED:
        return 'Reports generated successfully!';
      default:
        return 'Ready to generate your reports';
    }
  };

  const isGenerating = (
    generationStatus === GenerationStatus.PREPARING ||
    generationStatus === GenerationStatus.GENERATING ||
    generationStatus === GenerationStatus.PROCESSING
  );
  const isCompleted = generationStatus === GenerationStatus.COMPLETED;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Generate Document
        </h1>
        <p className="text-lg text-gray-600">
          Review your selections and generate your report
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Domain</h3>
            <p className="text-lg text-gray-900">{selectedDomain?.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Template</h3>
            <p className="text-lg text-gray-900">{selectedTemplate?.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Data Source</h3>
            <p className="text-lg text-gray-900">{selectedDataSource?.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Document Title</h3>
            <p className="text-lg text-gray-900">{formData.documentTitle}</p>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV Data</h3>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  {csvFile ? (
                    <span className="font-semibold text-green-600">{csvFile.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold">Click to upload</span> your CSV file
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500">CSV files only (MAX. 10MB)</p>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isGenerating}
              />
            </label>
          </div>
          {csvFile && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Selected:</span> {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Generation Status */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generation Status</h3>
            <div className="flex items-center space-x-2">
              {isGenerating && <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />}
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
              <span className="text-sm text-gray-600">{getStatusMessage()}</span>
            </div>
          </div>

          {/* Progress Bar */}
          {(isGenerating || isCompleted) && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {generationStatus === GenerationStatus.IDLE && (
              <button
                onClick={handleStartGeneration}
                disabled={!csvFile}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Reports
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {isCompleted && (
              <button
                onClick={handleViewReports}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                View & Download Reports
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};