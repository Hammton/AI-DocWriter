"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const csvParser_1 = require("./services/csvParser");
const reportGenerator_1 = require("./services/reportGenerator");
const pdfGenerator_1 = require("./services/pdfGenerator");
const documentExporter_1 = require("./services/documentExporter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const upload = (0, multer_1.default)({
    dest: path_1.default.join(__dirname, '../data/uploads'),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
});
const logoUpload = (0, multer_1.default)({
    dest: path_1.default.join(__dirname, '../data/uploads/logos'),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
const generatedReports = new Map();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../data/uploads')));
app.use('/generated', express_1.default.static(path_1.default.join(__dirname, '../data/generated')));
app.get('/api/templates', (req, res) => {
    try {
        const templatesDir = path_1.default.join(__dirname, '../data/templates');
        const files = fs_1.default.readdirSync(templatesDir);
        const templates = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
            const filePath = path_1.default.join(templatesDir, file);
            const content = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
            return {
                id: content.id,
                name: content.name,
                description: content.description,
                avgPages: content.avgPages
            };
        });
        res.json({ templates });
    }
    catch (error) {
        console.error('Error loading templates:', error);
        res.status(500).json({ error: 'Failed to load templates' });
    }
});
app.get('/api/templates/:id', (req, res) => {
    try {
        const templatePath = path_1.default.join(__dirname, '../data/templates', `${req.params.id}.json`);
        if (!fs_1.default.existsSync(templatePath)) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const template = JSON.parse(fs_1.default.readFileSync(templatePath, 'utf8'));
        return res.json(template);
    }
    catch (error) {
        console.error('Error loading template:', error);
        return res.status(500).json({ error: 'Failed to load template' });
    }
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        templates: {
            application: fs_1.default.existsSync(path_1.default.join(__dirname, '../data/templates/application-profile.json')),
            business: fs_1.default.existsSync(path_1.default.join(__dirname, '../data/templates/business-profile.json')),
            demand: fs_1.default.existsSync(path_1.default.join(__dirname, '../data/templates/demand-profile.json'))
        },
        environment: {
            hasAzureOpenAIKey: !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT),
            nodeEnv: process.env.NODE_ENV
        }
    });
});
app.post('/api/debug/csv', upload.single('csvFile'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        console.log('Debug: CSV file received:', file.originalname, file.size);
        const applicationData = await (0, csvParser_1.parseCSVFile)(file.path);
        fs_1.default.unlinkSync(file.path);
        return res.json({
            message: 'CSV parsed successfully',
            recordCount: applicationData.length,
            firstRecord: applicationData[0] || null
        });
    }
    catch (error) {
        console.error('Debug CSV parse error:', error);
        return res.status(500).json({
            error: 'CSV parsing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.post('/api/generate-reports', upload.single('csvFile'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { templateId } = req.body;
        const file = req.file;
        if (!templateId) {
            return res.status(400).json({ error: 'Template ID is required' });
        }
        if (!file) {
            return res.status(400).json({ error: 'CSV file is required' });
        }
        console.log(`Processing CSV file: ${file.originalname} for template: ${templateId}`);
        const applicationData = await (0, csvParser_1.parseCSVFile)(file.path);
        console.log(`Parsed ${applicationData.length} applications from CSV`);
        if (applicationData.length === 0) {
            return res.status(400).json({ error: 'No valid application data found in CSV file' });
        }
        const template = await (0, reportGenerator_1.loadTemplate)(templateId);
        const reports = [];
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        for (let i = 0; i < applicationData.length; i++) {
            const appData = applicationData[i];
            console.log(`Generating report ${i + 1}/${applicationData.length} for ${appData.application_name}`);
            try {
                const azureOpenAIKeyExists = !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT);
                const templateMappings = (0, csvParser_1.mapApplicationDataToTemplate)(appData);
                const report = await (0, reportGenerator_1.generateReportContent)(template, appData, templateMappings);
                reports.push(report);
            }
            catch (error) {
                console.error(`Error generating report for ${appData.application_name}:`, error);
            }
        }
        generatedReports.set(sessionId, reports);
        fs_1.default.unlinkSync(file.path);
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
    }
    catch (error) {
        console.error('Error generating reports:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        return res.status(500).json({
            error: 'Failed to generate reports',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
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
                sections: report.sections
            }))
        });
    }
    catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({ error: 'Failed to fetch reports' });
    }
});
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
        res.setHeader('Content-Type', 'text/html');
        return res.send(report.htmlContent);
    }
    catch (error) {
        console.error('Error getting report preview:', error);
        return res.status(500).json({ error: 'Failed to get report preview' });
    }
});
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
        const pdfPath = await (0, pdfGenerator_1.generateReportPDF)(report);
        const filename = `${report.applicationName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const pdfStream = fs_1.default.createReadStream(pdfPath);
        pdfStream.pipe(res);
        pdfStream.on('end', () => {
            setTimeout(() => {
                try {
                    fs_1.default.unlinkSync(pdfPath);
                }
                catch (error) {
                    console.error('Error cleaning up PDF file:', error);
                }
            }, 5000);
        });
        return;
    }
    catch (error) {
        console.error('Error downloading report PDF:', error);
        return res.status(500).json({
            error: 'Failed to generate PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.post('/api/upload-logo', logoUpload.single('logo'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No logo file provided' });
        }
        const logoPath = file.path;
        const logoUrl = `/uploads/logos/${path_1.default.basename(logoPath)}`;
        return res.json({
            message: 'Logo uploaded successfully',
            logoPath,
            logoUrl,
            filename: file.originalname
        });
    }
    catch (error) {
        console.error('Error uploading logo:', error);
        return res.status(500).json({ error: 'Failed to upload logo' });
    }
});
app.post('/api/reports/:sessionId/:reportId/export', logoUpload.single('customLogo'), async (req, res) => {
    try {
        const { sessionId, reportId } = req.params;
        const { format = 'pdf', useDefaultLogo = false, stakeholderAudience = [], customInstructions = '' } = req.body;
        let parsedStakeholders = [];
        if (typeof stakeholderAudience === 'string') {
            try {
                parsedStakeholders = JSON.parse(stakeholderAudience);
            }
            catch {
                parsedStakeholders = stakeholderAudience.split(',').map(s => s.trim()).filter(s => s);
            }
        }
        else if (Array.isArray(stakeholderAudience)) {
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
        const exporter = new documentExporter_1.DocumentExporter();
        const exportOptions = {
            format: format,
            useDefaultLogo: useDefaultLogo === 'true' || useDefaultLogo === true,
            stakeholderAudience: parsedStakeholders,
            customInstructions
        };
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
    }
    catch (error) {
        console.error('Error exporting document:', error);
        return res.status(500).json({
            error: 'Failed to export document',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
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
        }
        else {
            console.warn(`AI enhancement failed for ${sectionTitle}: Invalid response structure`);
            return res.status(500).json({ error: 'Failed to generate enhanced content' });
        }
    }
    catch (error) {
        console.error('Error in AI enhancement:', error);
        return res.status(500).json({
            error: 'Failed to enhance content with AI',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
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
        if (sections) {
            report.sections = sections;
        }
        if (title) {
            report.title = title;
        }
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
        <p>This report was generated on ${currentDate} by AI DocuWriter</p>
    </div>
</body>
</html>
`;
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
    }
    catch (error) {
        console.error('Error updating report:', error);
        return res.status(500).json({ error: 'Failed to update report' });
    }
});
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 AI DocuWriter Backend running on port ${PORT}`);
    console.log(`📋 Templates available at http://localhost:${PORT}/api/templates`);
    console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
});
exports.default = app;
//# sourceMappingURL=app.js.map