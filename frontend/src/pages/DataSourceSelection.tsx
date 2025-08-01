import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Upload, Zap, FileSpreadsheet, X } from 'lucide-react';
import type { DataSource } from '../types';
import { DataSourceType, WorkflowStep } from '../types';
import { useWorkflowStore } from '../stores/workflowStore';

const dataSources: DataSource[] = [
  {
    id: '1',
    type: DataSourceType.ARDOQ,
    name: 'Ardoq',
    description: 'Enterprise architecture and data management platform',
    icon: 'Database',
    connectionRequired: true,
  },
  {
    id: '2',
    type: DataSourceType.ABACUS,
    name: 'Abacus',
    description: 'Business intelligence and analytics platform',
    icon: 'Upload',
    connectionRequired: true,
  },
  {
    id: '3',
    type: DataSourceType.GRAPHDB,
    name: 'GraphDB',
    description: 'Graph database for complex data relationships',
    icon: 'Zap',
    connectionRequired: true,
  },
  {
    id: '4',
    type: DataSourceType.EXCEL_FILE,
    name: 'File Upload',
    description: 'Upload CSV, XLS, PDF, or text files directly',
    icon: 'FileSpreadsheet',
    connectionRequired: false,
  },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  Database,
  Upload,
  Zap,
  FileSpreadsheet,
};

interface ApiConnection {
  url: string;
  token?: string;
  username?: string;
  password?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export const DataSourceSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedDataSource, setCurrentStep, completeStep } = useWorkflowStore();
  
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    url: '',
    token: '',
    username: '',
    password: ''
  });
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleDataSourceSelect = (dataSource: DataSource) => {
    setSelectedSource(dataSource);
    if (!dataSource.connectionRequired) {
      // For file upload, don't navigate immediately
      return;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.type) || 
          file.name.toLowerCase().endsWith('.csv') ||
          file.name.toLowerCase().endsWith('.xls') ||
          file.name.toLowerCase().endsWith('.xlsx')) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          file
        });
      } else {
        alert('Please select a CSV, XLS, PDF, or text file');
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleApiConnect = async () => {
    if (!selectedSource || !apiConnection.url) return;
    
    setIsConnecting(true);
    // Simulate API connection test
    setTimeout(() => {
      setIsConnecting(false);
      alert(`Successfully connected to ${selectedSource.name}!`);
      proceedToGeneration();
    }, 2000);
  };

  const proceedToGeneration = () => {
    if (selectedSource) {
      setSelectedDataSource(selectedSource);
      completeStep(WorkflowStep.CONNECT_DATA_SOURCE);
      setCurrentStep(WorkflowStep.GENERATE_DOCUMENT);
      navigate('/generate-report');
    }
  };

  const handleBack = () => {
    setCurrentStep(WorkflowStep.ENTER_INPUTS);
    navigate('/input-form');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Select Your Data Source
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Choose where to pull data for your report
        </p>
      </div>

      {!selectedSource ? (
        // Data Source Selection
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {dataSources.map((dataSource) => {
            const IconComponent = iconMap[dataSource.icon];
            
            return (
              <div
                key={dataSource.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-300 group"
                onClick={() => handleDataSourceSelect(dataSource)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {dataSource.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {dataSource.description}
                  </p>

                  {dataSource.connectionRequired && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Connection Required
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Connection/Upload Form
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setSelectedSource(null)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  {React.createElement(iconMap[selectedSource.icon], { className: "w-6 h-6 text-blue-600" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSource.name}</h2>
                  <p className="text-gray-600">{selectedSource.description}</p>
                </div>
              </div>
            </div>

            {selectedSource.connectionRequired ? (
              // API Connection Form
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Connection Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API URL *
                    </label>
                    <input
                      type="url"
                      value={apiConnection.url}
                      onChange={(e) => setApiConnection(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={`https://api.${selectedSource.name.toLowerCase()}.com`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={apiConnection.token}
                      onChange={(e) => setApiConnection(prev => ({ ...prev, token: e.target.value }))}
                      placeholder="Enter your API token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={apiConnection.username}
                      onChange={(e) => setApiConnection(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username (if required)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={apiConnection.password}
                      onChange={(e) => setApiConnection(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password (if required)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedSource(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApiConnect}
                    disabled={!apiConnection.url || isConnecting}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Connecting...' : 'Test Connection & Continue'}
                  </button>
                </div>
              </div>
            ) : (
              // File Upload Form
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Upload Your File</h3>
                
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors">
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <span className="text-lg font-medium text-gray-900 mb-2">
                          Drop your file here or click to browse
                        </span>
                        <span className="text-sm text-gray-500">
                          Supports CSV, XLS, XLSX, PDF, and TXT files up to 50MB
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xls,.xlsx,.pdf,.txt,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,text/plain"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedSource(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedToGeneration}
                    disabled={!uploadedFile}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Generate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedSource && (
        <div className="flex justify-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      )}
    </div>
  );
};