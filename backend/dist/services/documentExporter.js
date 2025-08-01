"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentExporter = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const docx_1 = require("docx");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
class DocumentExporter {
    constructor() {
        this.defaultLogoPath = path_1.default.join(__dirname, '../../public/assets/dq-logo.png');
    }
    async exportDocument(report, options) {
        if (options.format === 'pdf') {
            return this.generatePDF(report, options);
        }
        else {
            return this.generateDOCX(report, options);
        }
    }
    async generatePDF(report, options) {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            const htmlContent = await this.generateHTMLWithLogo(report, options);
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                }
            });
            return Buffer.from(pdfBuffer);
        }
        finally {
            await browser.close();
        }
    }
    async generateDOCX(report, options) {
        const doc = new docx_1.Document({
            sections: [{
                    properties: {},
                    children: await this.generateDOCXContent(report, options)
                }]
        });
        return await docx_1.Packer.toBuffer(doc);
    }
    async generateHTMLWithLogo(report, options) {
        const logoBase64 = await this.getLogoAsBase64(options);
        const stakeholderText = this.formatStakeholderAudience(options.stakeholderAudience);
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `
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
        .logo {
            margin-bottom: 20px;
        }
        .logo img {
            max-height: 80px;
            max-width: 200px;
            object-fit: contain;
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
        .metadata {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
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
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .table th, .table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        .table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        .table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .stakeholder-info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        ${logoBase64 ? `<div class="logo"><img src="${logoBase64}" alt="Organization Logo" /></div>` : ''}
        <div class="organization-name">${report.organizationName}</div>
        <h1 class="report-title">${report.title}</h1>
        <div class="subtitle">Application Owner: ${report.metadata.applicationId}</div>
        <div class="subtitle">Report Owner: Enterprise Architecture</div>
    </div>

    ${stakeholderText ? `
    <div class="stakeholder-info">
        <h3>Stakeholder Audience</h3>
        <p>${stakeholderText}</p>
    </div>
    ` : ''}

    <div class="metadata">
        <h3>Report Information</h3>
        <table class="table">
            <tr><td><strong>Application Name:</strong></td><td>${report.applicationName}</td></tr>
            <tr><td><strong>Organization:</strong></td><td>${report.organizationName}</td></tr>
            <tr><td><strong>Generated Date:</strong></td><td>${currentDate}</td></tr>
            <tr><td><strong>Template:</strong></td><td>${report.metadata.templateId}</td></tr>
        </table>
    </div>

    ${report.sections.map(section => `
        <div class="section">
            <h2 class="section-title">${section.title}</h2>
            <div class="section-content">
                ${this.formatContent(section.content)}
            </div>
        </div>
    `).join('')}

    <div class="footer">
        <p>This report was generated on ${currentDate} by AI DocuWriter</p>
        ${stakeholderText ? `<p>Stakeholder Audience: ${stakeholderText}</p>` : ''}
    </div>
</body>
</html>
`;
    }
    async generateDOCXContent(report, options) {
        const content = [];
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (options.logoPath || options.useDefaultLogo) {
            try {
                const logoPath = options.logoPath || this.defaultLogoPath;
                if (fs_1.default.existsSync(logoPath)) {
                    const logoBuffer = await this.processImageForDOCX(logoPath);
                    content.push(new docx_1.Paragraph({
                        alignment: docx_1.AlignmentType.CENTER,
                        children: [
                            new docx_1.ImageRun({
                                data: logoBuffer,
                                transformation: {
                                    width: 200,
                                    height: 80,
                                },
                            }),
                        ],
                    }));
                }
            }
            catch (error) {
                console.warn('Failed to add logo to DOCX:', error);
            }
        }
        content.push(new docx_1.Paragraph({
            text: report.organizationName,
            heading: docx_1.HeadingLevel.TITLE,
            alignment: docx_1.AlignmentType.CENTER,
        }), new docx_1.Paragraph({
            text: report.title,
            heading: docx_1.HeadingLevel.HEADING_1,
            alignment: docx_1.AlignmentType.CENTER,
        }));
        if (options.stakeholderAudience && options.stakeholderAudience.length > 0) {
            content.push(new docx_1.Paragraph({
                text: "Stakeholder Audience",
                heading: docx_1.HeadingLevel.HEADING_2,
            }), new docx_1.Paragraph({
                text: this.formatStakeholderAudience(options.stakeholderAudience),
            }));
        }
        for (const section of report.sections) {
            content.push(new docx_1.Paragraph({
                text: section.title,
                heading: docx_1.HeadingLevel.HEADING_2,
            }), new docx_1.Paragraph({
                text: section.content.replace(/<[^>]*>/g, ''),
            }));
        }
        content.push(new docx_1.Paragraph({
            text: `This report was generated on ${currentDate} by AI DocuWriter`,
            alignment: docx_1.AlignmentType.CENTER,
        }));
        if (options.stakeholderAudience && options.stakeholderAudience.length > 0) {
            content.push(new docx_1.Paragraph({
                text: `Stakeholder Audience: ${this.formatStakeholderAudience(options.stakeholderAudience)}`,
                alignment: docx_1.AlignmentType.CENTER,
            }));
        }
        return content;
    }
    async getLogoAsBase64(options) {
        try {
            let logoPath = null;
            if (options.logoPath && fs_1.default.existsSync(options.logoPath)) {
                logoPath = options.logoPath;
            }
            else if (options.useDefaultLogo && fs_1.default.existsSync(this.defaultLogoPath)) {
                logoPath = this.defaultLogoPath;
            }
            if (!logoPath)
                return null;
            const processedImage = await (0, sharp_1.default)(logoPath)
                .resize(200, 80, { fit: 'inside', withoutEnlargement: true })
                .png()
                .toBuffer();
            return `data:image/png;base64,${processedImage.toString('base64')}`;
        }
        catch (error) {
            console.warn('Failed to process logo:', error);
            return null;
        }
    }
    async processImageForDOCX(imagePath) {
        return await (0, sharp_1.default)(imagePath)
            .resize(200, 80, { fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer();
    }
    formatStakeholderAudience(stakeholders) {
        if (!stakeholders || stakeholders.length === 0)
            return '';
        if (stakeholders.length === 1)
            return stakeholders[0];
        if (stakeholders.length === 2)
            return stakeholders.join(' and ');
        const lastStakeholder = stakeholders.pop();
        return stakeholders.join(', ') + ', and ' + lastStakeholder;
    }
    formatContent(content) {
        const paragraphs = content.split('\n').filter(p => p.trim());
        return paragraphs.map(paragraph => {
            if (paragraph.trim().match(/^\d+\./)) {
                return `<li>${paragraph.replace(/^\d+\.\s*/, '')}</li>`;
            }
            if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                return `<li>${paragraph.replace(/^[•-]\s*/, '')}</li>`;
            }
            if (paragraph.includes(':**') || paragraph.includes('**')) {
                const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return `<p>${formatted}</p>`;
            }
            return `<p>${paragraph}</p>`;
        }).join('');
    }
}
exports.DocumentExporter = DocumentExporter;
//# sourceMappingURL=documentExporter.js.map