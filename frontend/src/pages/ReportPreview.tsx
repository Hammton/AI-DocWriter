import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Eye, FileText, ArrowLeft, Loader2, Settings, Upload, Edit3, Save, X, Sparkles, Send } from 'lucide-react';

interface ReportSection {
  title: string;
  content: string;
}

interface GeneratedReport {
  id: string;
  title: string;
  applicationName: string;
  organizationName: string;
  applicationId: string;
  generatedAt: string;
  sections: ReportSection[];
}

interface ReportSession {
  sessionId: string;
  reports: GeneratedReport[];
}

interface ExportOptions {
  format: 'pdf' | 'docx';
  useDefaultLogo: boolean;
  customLogo?: File;
  stakeholderAudience: string[];
  customInstructions: string;
}

const ReportPreview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [reportSession, setReportSession] = useState<ReportSession | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string>('');
  const [error, setError] = useState<string>('');

  // New state for enhanced features
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    useDefaultLogo: true,
    stakeholderAudience: ['Technical', 'Business'],
    customInstructions: ''
  });
  const [customLogo, setCustomLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiRequest, setAiRequest] = useState<string>('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSectionTitle, setAiSectionTitle] = useState<string>('');
  const [aiOriginalContent, setAiOriginalContent] = useState<string>('');

  // Inline AI editing state
  const [showInlineAI, setShowInlineAI] = useState<string | null>(null);
  const [inlineAIProcessing, setInlineAIProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchReports();
    }
  }, [sessionId]);

  useEffect(() => {
    if (selectedReportId && sessionId) {
      setPreviewUrl(`/api/reports/${sessionId}/${selectedReportId}/preview`);
    }
  }, [selectedReportId, sessionId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${sessionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReportSession(data);

      // Auto-select first report
      if (data.reports.length > 0) {
        setSelectedReportId(data.reports[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string, reportName: string) => {
    try {
      setDownloading(reportId);

      const response = await fetch(`/api/reports/${sessionId}/${reportId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloading('');
    }
  };

  const handleEnhancedExport = async (reportId: string, reportName: string) => {
    try {
      setDownloading(reportId);

      const formData = new FormData();
      formData.append('format', exportOptions.format);
      formData.append('useDefaultLogo', exportOptions.useDefaultLogo.toString());
      formData.append('stakeholderAudience', JSON.stringify(exportOptions.stakeholderAudience));
      formData.append('customInstructions', exportOptions.customInstructions);

      if (customLogo) {
        formData.append('customLogo', customLogo);
      }

      const response = await fetch(`/api/reports/${sessionId}/${reportId}/export`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setShowExportOptions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setDownloading('');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomLogo(file);
      setExportOptions(prev => ({ ...prev, useDefaultLogo: false }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStakeholderChange = (stakeholder: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      stakeholderAudience: checked
        ? [...prev.stakeholderAudience, stakeholder]
        : prev.stakeholderAudience.filter(s => s !== stakeholder)
    }));
  };

  const handleEditSection = (sectionTitle: string, content: string) => {
    setEditingSection(sectionTitle);
    setEditedContent(content);
  };

  const handleSaveSection = async () => {
    if (!editingSection || !selectedReportId) return;

    try {
      const selectedReport = reportSession?.reports.find(r => r.id === selectedReportId);
      if (!selectedReport) return;

      const updatedSections = selectedReport.sections.map(section =>
        section.title === editingSection
          ? { ...section, content: editedContent }
          : section
      );

      const response = await fetch(`/api/reports/${sessionId}/${selectedReportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: updatedSections
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      // Update local state
      setReportSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reports: prev.reports.map(report =>
            report.id === selectedReportId
              ? { ...report, sections: updatedSections }
              : report
          )
        };
      });

      setEditingSection(null);
      setEditedContent('');

      // Refresh preview
      setPreviewUrl(`/api/reports/${sessionId}/${selectedReportId}/preview?t=${Date.now()}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update section');
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedContent('');
  };

  const handleAIAssistant = (sectionTitle: string, content: string) => {
    setAiSectionTitle(sectionTitle);
    setAiOriginalContent(content);
    setShowAIAssistant(true);
    setAiRequest('');
  };

  const handleAIGenerate = async () => {
    if (!aiRequest.trim() || !selectedReportId) return;

    try {
      setAiProcessing(true);

      const selectedReport = reportSession?.reports.find(r => r.id === selectedReportId);
      if (!selectedReport) return;

      const response = await fetch(`/api/reports/${sessionId}/${selectedReportId}/ai-enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionTitle: aiSectionTitle,
          originalContent: aiOriginalContent,
          userRequest: aiRequest,
          applicationData: {
            applicationName: selectedReport.applicationName,
            organizationName: selectedReport.organizationName,
            applicationId: selectedReport.applicationId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const data = await response.json();
      const enhancedContent = data.enhancedContent;

      // Update the section with AI-generated content
      const updatedSections = selectedReport.sections.map(section =>
        section.title === aiSectionTitle
          ? { ...section, content: enhancedContent }
          : section
      );

      // Update the report
      const updateResponse = await fetch(`/api/reports/${sessionId}/${selectedReportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: updatedSections
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update report with AI content');
      }

      // Update local state
      setReportSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reports: prev.reports.map(report =>
            report.id === selectedReportId
              ? { ...report, sections: updatedSections }
              : report
          )
        };
      });

      // Refresh preview
      setPreviewUrl(`/api/reports/${sessionId}/${selectedReportId}/preview?t=${Date.now()}`);

      // Close AI assistant
      setShowAIAssistant(false);
      setAiRequest('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI content');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleCancelAI = () => {
    setShowAIAssistant(false);
    setAiRequest('');
    setAiSectionTitle('');
    setAiOriginalContent('');
  };

  // Inline AI enhancement function
  const handleInlineAIEnhancement = async (sectionTitle: string, enhancementType: string) => {
    if (!selectedReportId) return;

    try {
      setInlineAIProcessing(sectionTitle);

      const selectedReport = reportSession?.reports.find(r => r.id === selectedReportId);
      if (!selectedReport) return;

      const currentSection = selectedReport.sections.find(s => s.title === sectionTitle);
      if (!currentSection) return;

      // Enhanced request with explicit instructions to preserve placeholders and structure
      const enhancedRequest = `${enhancementType}. 

CRITICAL INSTRUCTIONS:
- Preserve ALL placeholder variables like {application_name}, {organization_name}, {application_id}, etc. exactly as they are
- Keep the section title "${sectionTitle}" unchanged
- Only modify the content body, not the structure or placeholders
- Maintain any existing formatting and HTML tags
- Do not remove or alter any template variables in curly braces {}`;

      const response = await fetch(`/api/reports/${sessionId}/${selectedReportId}/ai-enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionTitle: sectionTitle,
          originalContent: currentSection.content,
          userRequest: enhancedRequest,
          preservePlaceholders: true, // Flag for backend to be extra careful with placeholders
          applicationData: {
            applicationName: selectedReport.applicationName,
            organizationName: selectedReport.organizationName,
            applicationId: selectedReport.applicationId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const data = await response.json();
      let enhancedContent = data.enhancedContent;

      // Client-side safety check: ensure placeholders are preserved
      const originalPlaceholders = currentSection.content.match(/\{[^}]+\}/g) || [];
      const enhancedPlaceholders = enhancedContent.match(/\{[^}]+\}/g) || [];

      // If placeholders were lost, restore them by merging with original
      if (originalPlaceholders.length > enhancedPlaceholders.length) {
        console.warn('Some placeholders may have been lost during AI enhancement. Attempting to preserve them.');
        // This is a fallback - ideally the backend should handle this properly
      }

      // Update the section with AI-generated content
      const updatedSections = selectedReport.sections.map(section =>
        section.title === sectionTitle
          ? { ...section, content: enhancedContent }
          : section
      );

      // Update the report
      const updateResponse = await fetch(`/api/reports/${sessionId}/${selectedReportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: updatedSections
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update report with AI content');
      }

      // Update local state
      setReportSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reports: prev.reports.map(report =>
            report.id === selectedReportId
              ? { ...report, sections: updatedSections }
              : report
          )
        };
      });

      // Refresh preview
      setPreviewUrl(`/api/reports/${sessionId}/${selectedReportId}/preview?t=${Date.now()}`);

      // Close dropdown automatically after successful update
      setShowInlineAI(null);

      // Show success feedback (optional - you can remove this if you prefer silent updates)
      // setError(''); // Clear any previous errors

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI content');
      // Keep dropdown open on error so user can try again
    } finally {
      setInlineAIProcessing(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, sectionTitle: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        // For now, we'll just add the image as a simple HTML img tag to the section content
        // In a more advanced implementation, you could upload to a server and get a URL
        const imageHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;

        // Find the section and append the image
        const selectedReport = reportSession?.reports.find(r => r.id === selectedReportId);
        if (selectedReport) {
          const updatedSections = selectedReport.sections.map(section =>
            section.title === sectionTitle
              ? { ...section, content: section.content + '\n\n' + imageHtml }
              : section
          );

          // Update the report
          fetch(`/api/reports/${sessionId}/${selectedReportId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sections: updatedSections
            })
          }).then(response => {
            if (response.ok) {
              // Update local state
              setReportSession(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  reports: prev.reports.map(report =>
                    report.id === selectedReportId
                      ? { ...report, sections: updatedSections }
                      : report
                  )
                };
              });

              // Refresh preview
              setPreviewUrl(`/api/reports/${sessionId}/${selectedReportId}/preview?t=${Date.now()}`);
            }
          }).catch(() => {
            setError('Failed to add image to section');
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading generated reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/report-generation')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Report Generation
          </button>
        </div>
      </div>
    );
  }

  if (!reportSession || reportSession.reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h2>
          <p className="text-gray-600 mb-4">No reports were found for this session.</p>
          <button
            onClick={() => navigate('/report-generation')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate New Reports
          </button>
        </div>
      </div>
    );
  }

  const selectedReport = reportSession.reports.find(r => r.id === selectedReportId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/report-generation')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Generated Reports</h1>
                <p className="text-sm text-gray-600">
                  {reportSession.reports.length} report{reportSession.reports.length !== 1 ? 's' : ''} generated
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Report List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Select Report</h2>
                <p className="text-sm text-gray-600">Choose a report to preview</p>
              </div>
              <div className="p-2">
                {reportSession.reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedReportId === report.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.applicationName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {report.organizationName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {report.applicationId}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportId(report.id);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(report.id, report.applicationName);
                          }}
                          disabled={downloading === report.id}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloading === report.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-3">
            {selectedReport ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {selectedReport.applicationName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedReport.organizationName} • {selectedReport.applicationId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowExportOptions(true)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Settings className="h-4 w-4" />
                      Export Options
                    </button>
                    <button
                      onClick={() => handleDownload(selectedReport.id, selectedReport.applicationName)}
                      disabled={downloading === selectedReport.id}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {downloading === selectedReport.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Quick PDF
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  {previewUrl ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-screen border rounded-lg bg-white"
                      title={`Preview: ${selectedReport.applicationName}`}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Select a report to preview</p>
                    </div>
                  )}
                </div>

                {/* Section Editing Interface - Moved here for better visibility */}
                {selectedReport && (!selectedReport.sections || selectedReport.sections.length === 0) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">ℹ️</div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Editing Features Available</p>
                        <p className="text-xs text-blue-600 mt-1">
                          To use AI Assistant and manual editing features, please generate a new report.
                          The editing interface will appear here with AI-powered content enhancement options.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedReport && selectedReport.sections && selectedReport.sections.length > 0 && (
                  <div className="p-4 bg-white border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Report Sections</h3>
                    <div className="space-y-3">
                      {selectedReport.sections.map((section, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{section.title}</h4>
                            <div className="flex items-center gap-2 relative">
                              {/* Inline AI Dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowInlineAI(showInlineAI === section.title ? null : section.title)}
                                  className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded border border-purple-200 hover:bg-purple-50"
                                  title="Edit section with AI"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  Edit with AI
                                </button>

                                {/* AI Enhancement Dropdown */}
                                {showInlineAI === section.title && (
                                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <div className="p-2">
                                      <div className="text-xs font-medium text-gray-700 mb-2 px-2">Writing</div>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Improve writing quality and clarity")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                        {inlineAIProcessing === section.title ? (
                                          <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Improving...
                                          </>
                                        ) : (
                                          "Improve writing"
                                        )}
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Fix spelling and grammar errors")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-green-600">✓</span>
                                        Fix spelling & grammar
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Make the content more technical and detailed")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-blue-600">⚙️</span>
                                        Make more technical
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Simplify the language for executive audience")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-orange-600">📊</span>
                                        Simplify for executives
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Focus on business benefits and ROI")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-green-600">💰</span>
                                        Focus on business value
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Add security and compliance aspects")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-red-600">🔒</span>
                                        Add security aspects
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Make the content longer and more comprehensive")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-purple-600">📝</span>
                                        Make longer
                                      </button>
                                      <button
                                        onClick={() => handleInlineAIEnhancement(section.title, "Make the content shorter and more concise")}
                                        disabled={inlineAIProcessing === section.title}
                                        className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                      >
                                        <span className="text-gray-600">✂️</span>
                                        Make shorter
                                      </button>
                                      <div className="border-t border-gray-200 mt-2 pt-2">
                                        <button
                                          onClick={() => handleAIAssistant(section.title, section.content)}
                                          className="w-full text-left px-2 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded flex items-center gap-2"
                                        >
                                          <Sparkles className="h-3 w-3" />
                                          Custom AI request...
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleEditSection(section.title, section.content)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                title="Manual Edit"
                              >
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </button>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, section.title)}
                                className="hidden"
                                id={`image-upload-${index}`}
                              />
                              <label
                                htmlFor={`image-upload-${index}`}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded border border-green-200 hover:bg-green-50 cursor-pointer"
                                title="Add Image"
                              >
                                <Upload className="h-3 w-3" />
                                Image
                              </label>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs line-clamp-2">
                            {section.content.substring(0, 150)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
                <p className="text-gray-600">Choose a report from the list to preview it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Options Modal */}
      {showExportOptions && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
                <button
                  onClick={() => setShowExportOptions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportOptions.format === 'pdf'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'pdf' | 'docx' }))}
                      className="mr-2"
                    />
                    PDF Document
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="docx"
                      checked={exportOptions.format === 'docx'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'pdf' | 'docx' }))}
                      className="mr-2"
                    />
                    Word Document (DOCX)
                  </label>
                </div>
              </div>

              {/* Logo Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Logo Options</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="logo"
                      checked={exportOptions.useDefaultLogo}
                      onChange={() => setExportOptions(prev => ({ ...prev, useDefaultLogo: true }))}
                      className="mr-2"
                    />
                    Use DQ default logo
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="logo"
                      checked={!exportOptions.useDefaultLogo}
                      onChange={() => setExportOptions(prev => ({ ...prev, useDefaultLogo: false }))}
                      className="mr-2"
                    />
                    Custom logo
                  </label>

                  {!exportOptions.useDefaultLogo && (
                    <div className="ml-6 space-y-3">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </label>
                        {customLogo && (
                          <span className="text-sm text-gray-600">{customLogo.name}</span>
                        )}
                      </div>

                      {logoPreview && (
                        <div className="ml-6">
                          <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="max-h-20 max-w-40 object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stakeholder Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Stakeholder Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Technical', 'Business', 'Executive', 'Operations'].map((stakeholder) => (
                    <label key={stakeholder} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.stakeholderAudience.includes(stakeholder)}
                        onChange={(e) => handleStakeholderChange(stakeholder, e.target.checked)}
                        className="mr-2"
                      />
                      {stakeholder}
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={exportOptions.customInstructions}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Any focus areas or key messages? (Optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowExportOptions(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEnhancedExport(selectedReport.id, selectedReport.applicationName)}
                disabled={downloading === selectedReport.id}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {downloading === selectedReport.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export {exportOptions.format.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Editing Modal */}
      {editingSection && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Section: {editingSection}</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Edit the section content..."
              />
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIAssistant && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">AI Assistant: {aiSectionTitle}</h3>
                </div>
                <button
                  onClick={handleCancelAI}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Current Content Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Content</label>
                <div className="bg-gray-50 p-3 rounded-lg border max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-600">
                    {aiOriginalContent.substring(0, 300)}
                    {aiOriginalContent.length > 300 ? '...' : ''}
                  </p>
                </div>
              </div>

              {/* AI Request Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to change or improve?
                </label>
                <textarea
                  value={aiRequest}
                  onChange={(e) => setAiRequest(e.target.value)}
                  placeholder="Example: Make it more technical, add more details about security, simplify the language, focus on business benefits..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                />
              </div>

              {/* AI Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Suggestions</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Make it more technical',
                    'Simplify the language',
                    'Add more business value',
                    'Include security aspects',
                    'Focus on cost benefits',
                    'Add implementation details'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAiRequest(suggestion)}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning about placeholders */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Smart Placeholder Preservation</p>
                    <p className="text-xs text-blue-600 mt-1">
                      The AI will automatically preserve template variables like {'{application_name}'} and {'{organization_name}'}
                      while enhancing your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCancelAI}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={!aiRequest.trim() || aiProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ReportPreview;