import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { parseCSVFile, mapApplicationDataToTemplate, ApplicationData } from './services/csvParser';
import { loadTemplate, generateReportContent, GeneratedReport } from './services/reportGenerator';
import { generateReportPDF, getGeneratedReportsDir } from './services/pdfGenerator';
import { DocumentExporter, ExportOptions } from './services/documentExporter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../data/uploads'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Configure multer for logo uploads
const logoUpload = multer({
  dest: path.join(__dirname, '../data/uploads/logos'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// In-memory storage for generated reports
const generatedReports = new Map<string, GeneratedReport[]>();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads and generated files
app.use('/uploads', express.static(path.join(__dirname, '../../data/uploads')));
app.use('/generated', express.static(path.join(__dirname, '../../data/generated')));

// Template routes
app.get('/api/templates', (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../data/templates');
    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(templatesDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return {
          id: content.id,
          name: content.name,
          description: content.description,
          avgPages: content.avgPages
        };
      });
    
    res.json({ templates });
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

app.get('/api/templates/:id', (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../data/templates', `${req.params.id}.json`);
    
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    return res.json(template);
  } catch (error) {
    console.error('Error loading template:', error);
    return res.status(500).json({ error: 'Failed to load template' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    templates: {
      application: fs.existsSync(path.join(__dirname, '../data/templates/application-profile.json')),
      business: fs.existsSync(path.join(__dirname, '../data/templates/business-profile.json')),
      demand: fs.existsSync(path.join(__dirname, '../data/templates/demand-profile.json'))
    },
    environment: {
      hasAzureOpenAIKey: !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT),
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Debug endpoint to test CSV parsing
app.post('/api/debug/csv', upload.single('csvFile'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    console.log('Debug: CSV file received:', file.originalname, file.size);
    const applicationData = await parseCSVFile(file.path);
    
    // Clean up file
    fs.unlinkSync(file.path);
    
    return res.json({ 
      message: 'CSV parsed successfully',
      recordCount: applicationData.length,
      firstRecord: applicationData[0] || null
    });
  } catch (error) {
    console.error('Debug CSV parse error:', error);
    return res.status(500).json({ 
      error: 'CSV parsing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// File upload and report generation endpoint
app.post('/api/generate-reports', upload.single('csvFile'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { templateId, stakeholderAudience } = req.body;
    const file = req.file;
    
    // Parse stakeholder audience
    let parsedStakeholders: string[] = ['Technical', 'Business']; // Default
    if (stakeholderAudience) {
      try {
        parsedStakeholders = JSON.parse(stakeholderAudience);
      } catch {
        parsedStakeholders = ['Technical', 'Business'];
      }
    }
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    
    console.log(`Processing CSV file: ${file.originalname} for template: ${templateId}`);
    
    // Parse CSV file
    const applicationData = await parseCSVFile(file.path);
    console.log(`Parsed ${applicationData.length} applications from CSV`);
    
    if (applicationData.length === 0) {
      return res.status(400).json({ error: 'No valid application data found in CSV file' });
    }
    
    // Load template
    const template = await loadTemplate(templateId);
    
    // Generate reports for each application
    const reports: GeneratedReport[] = [];
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    for (let i = 0; i < applicationData.length; i++) {
      const appData = applicationData[i];
      console.log(`Generating report ${i + 1}/${applicationData.length} for ${appData.application_name}`);
      
      try {
        const azureOpenAIKeyExists = !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT);
        const templateMappings = mapApplicationDataToTemplate(appData);
        const report = await generateReportContent(template, appData, templateMappings);
        reports.push(report);
      } catch (error) {
        console.error(`Error generating report for ${appData.application_name}:`, error);
        // Continue with other reports even if one fails
      }
    }
    
    // Store reports in memory for this session
    generatedReports.set(sessionId, reports);
    
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    
    console.log(`Generated ${reports.length} reports successfully`);
    console.log('Generated reports:', reports);
    
    return res.json({
      message: `Generated ${reports.length} reports successfully`,
      sessionId,
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        applicationName: report.applicationName,
        organizationName: report.organizationName,
        applicationId: report.metadata.applicationId
      })),
      templateId,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating reports:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: 'Failed to generate reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get list of generated reports for a session
app.get('/api/reports/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const reports = generatedReports.get(sessionId);
    
    if (!reports) {
      return res.status(404).json({ error: 'Reports not found for this session' });
    }
    
    return res.json({
      sessionId,
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        applicationName: report.applicationName,
        organizationName: report.organizationName,
        applicationId: report.metadata.applicationId,
        generatedAt: report.metadata.generatedAt,
        sections: report.sections // Include sections for editing interface
      }))
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get preview HTML for a specific report
app.get('/api/reports/:sessionId/:reportId/preview', (req, res) => {
  try {
    const { sessionId, reportId } = req.params;
    const reports = generatedReports.get(sessionId);
    
    if (!reports) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Return HTML content for preview
    res.setHeader('Content-Type', 'text/html');
    return res.send(report.htmlContent);
    
  } catch (error) {
    console.error('Error getting report preview:', error);
    return res.status(500).json({ error: 'Failed to get report preview' });
  }
});

// Download PDF for a specific report (legacy endpoint)
app.get('/api/reports/:sessionId/:reportId/download', async (req, res) => {
  try {
    const { sessionId, reportId } = req.params;
    const reports = generatedReports.get(sessionId);
    
    if (!reports) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    console.log(`Generating PDF for report: ${report.title}`);
    
    // Generate PDF
    const pdfPath = await generateReportPDF(report);
    const filename = `${report.applicationName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
    
    // Send PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const pdfStream = fs.createReadStream(pdfPath);
    pdfStream.pipe(res);
    
    // Clean up PDF file after sending (optional)
    pdfStream.on('end', () => {
      setTimeout(() => {
        try {
          fs.unlinkSync(pdfPath);
        } catch (error) {
          console.error('Error cleaning up PDF file:', error);
        }
      }, 5000);
    });
    
    return; // Explicit return since we're streaming the response
    
  } catch (error) {
    console.error('Error downloading report PDF:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logo upload endpoint
app.post('/api/upload-logo', logoUpload.single('logo'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No logo file provided' });
    }
    
    const logoPath = file.path;
    const logoUrl = `/uploads/logos/${path.basename(logoPath)}`;
    
    return res.json({
      message: 'Logo uploaded successfully',
      logoPath,
      logoUrl,
      filename: file.originalname
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Enhanced document export endpoint
app.post('/api/reports/:sessionId/:reportId/export', logoUpload.single('customLogo'), async (req, res) => {
  try {
    const { sessionId, reportId } = req.params;
    const { 
      format = 'pdf', 
      useDefaultLogo = false, 
      stakeholderAudience = [],
      customInstructions = ''
    } = req.body;
    
    // Parse stakeholderAudience if it's a string
    let parsedStakeholders: string[] = [];
    if (typeof stakeholderAudience === 'string') {
      try {
        parsedStakeholders = JSON.parse(stakeholderAudience);
      } catch {
        parsedStakeholders = stakeholderAudience.split(',').map(s => s.trim()).filter(s => s);
      }
    } else if (Array.isArray(stakeholderAudience)) {
      parsedStakeholders = stakeholderAudience;
    }
    
    const reports = generatedReports.get(sessionId);
    if (!reports) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const exporter = new DocumentExporter();
    const exportOptions: ExportOptions = {
      format: format as 'pdf' | 'docx',
      useDefaultLogo: useDefaultLogo === 'true' || useDefaultLogo === true,
      stakeholderAudience: parsedStakeholders,
      customInstructions
    };
    
    // Use custom logo if uploaded
    if (req.file) {
      exportOptions.logoPath = req.file.path;
    }
    
    console.log(`Exporting ${format.toUpperCase()} for report: ${report.title}`);
    console.log('Export options:', exportOptions);
    
    const documentBuffer = await exporter.exportDocument(report, exportOptions);
    
    const fileExtension = format === 'pdf' ? 'pdf' : 'docx';
    const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const filename = `${report.applicationName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.${fileExtension}`;
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', documentBuffer.length);
    
    return res.send(documentBuffer);
    
  } catch (error) {
    console.error('Error exporting document:', error);
    return res.status(500).json({ 
      error: 'Failed to export document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI-powered content enhancement endpoint
app.post('/api/reports/:sessionId/:reportId/ai-enhance', async (req, res) => {
  try {
    const { sessionId, reportId } = req.params;
    const { sectionTitle, originalContent, userRequest, applicationData } = req.body;
    
    const reports = generatedReports.get(sessionId);
    if (!reports) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Use Azure OpenAI to enhance content based on user request
    const { AzureOpenAI } = require('openai');
    
    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
      return res.status(400).json({ error: 'Azure OpenAI not configured' });
    }
    
    const client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    });
    
    const prompt = `
You are an enterprise architect helping to improve a report section. 

IMPORTANT: Preserve any placeholder tags like {application_name}, {organization_name}, etc. that exist in the original content. These are template variables that must remain intact.

Section: ${sectionTitle}
Application: ${applicationData.applicationName}
Organization: ${applicationData.organizationName}
Application ID: ${applicationData.applicationId}

Original Content:
${originalContent}

User Request:
${userRequest}

Please enhance or modify the content based on the user's request while:
1. Keeping the same professional tone and structure
2. Preserving any placeholder tags (anything in curly braces like {variable_name})
3. Maintaining the technical accuracy and enterprise context
4. Ensuring the content remains relevant to the ${sectionTitle} section
5. Keeping it concise but informative (2-3 paragraphs maximum)

Return only the enhanced content, no additional formatting or explanations.
`;

    console.log(`AI enhancing section: ${sectionTitle} with request: ${userRequest}`);
    
    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4-32k',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      const enhancedContent = response.choices[0].message.content || originalContent;
      console.log(`Successfully enhanced content for section: ${sectionTitle}`);
      
      return res.json({
        enhancedContent,
        message: 'Content enhanced successfully'
      });
    } else {
      console.warn(`AI enhancement failed for ${sectionTitle}: Invalid response structure`);
      return res.status(500).json({ error: 'Failed to generate enhanced content' });
    }
    
  } catch (error) {
    console.error('Error in AI enhancement:', error);
    return res.status(500).json({ 
      error: 'Failed to enhance content with AI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update report content endpoint (for inline editing)
app.put('/api/reports/:sessionId/:reportId', (req, res) => {
  try {
    const { sessionId, reportId } = req.params;
    const { sections, title, customInstructions } = req.body;
    
    const reports = generatedReports.get(sessionId);
    if (!reports) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = reports[reportIndex];
    
    // Update report content
    if (sections) {
      report.sections = sections;
    }
    if (title) {
      report.title = title;
    }
    
    // Regenerate HTML content
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    report.htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .organization-name {
            color: #2563eb;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 2rem;
            color: #1e40af;
            margin: 10px 0;
        }
        .subtitle {
            font-size: 1.2rem;
            color: #64748b;
            margin: 5px 0;
        }
        .section {
            margin: 30px 0;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 1.5rem;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .section-content {
            margin-left: 10px;
            line-height: 1.8;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="organization-name">${report.organizationName}</div>
        <h1 class="report-title">${report.title}</h1>
        <div class="subtitle">Application Owner: ${report.metadata.applicationId}</div>
        <div class="subtitle">Report Owner: Enterprise Architecture</div>
    </div>

    ${report.sections.map(section => `
        <div class="section">
            <h2 class="section-title">${section.title}</h2>
            <div class="section-content">
                ${section.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
            </div>
        </div>
    `).join('')}

    <div class="footer">
        <p>This report was generated on ${currentDate} by AI DocWriter 4.0</p>
    </div>
</body>
</html>
`;
    
    // Update the report in the array
    reports[reportIndex] = report;
    generatedReports.set(sessionId, reports);
    
    return res.json({
      message: 'Report updated successfully',
      report: {
        id: report.id,
        title: report.title,
        sections: report.sections
      }
    });
    
  } catch (error) {
    console.error('Error updating report:', error);
    return res.status(500).json({ error: 'Failed to update report' });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI DocWriter 4.0 Backend running on port ${PORT}`);
  console.log(`📋 Templates available at http://localhost:${PORT}/api/templates`);
  console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
});

export default app;