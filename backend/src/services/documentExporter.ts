import puppeteer from 'puppeteer';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GeneratedReport } from './reportGenerator';

export interface ExportOptions {
  format: 'pdf' | 'docx';
  logoPath?: string;
  useDefaultLogo?: boolean;
  stakeholderAudience?: string[];
  customInstructions?: string;
}

export interface LogoConfig {
  path: string;
  width: number;
  height: number;
}

export class DocumentExporter {
  private defaultLogoPath = path.join(__dirname, '../../public/assets/dq-logo.png');

  async exportDocument(report: GeneratedReport, options: ExportOptions): Promise<Buffer> {
    if (options.format === 'pdf') {
      return this.generatePDF(report, options);
    } else {
      return this.generateDOCX(report, options);
    }
  }

  private async generatePDF(report: GeneratedReport, options: ExportOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Generate HTML with logo and stakeholder audience
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
    } finally {
      await browser.close();
    }
  }

  private async generateDOCX(report: GeneratedReport, options: ExportOptions): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: await this.generateDOCXContent(report, options)
      }]
    });

    return await Packer.toBuffer(doc);
  }

  private async generateHTMLWithLogo(report: GeneratedReport, options: ExportOptions): Promise<string> {
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
        <p>This report was generated on ${currentDate} by AI DocWriter 4.0</p>
        ${stakeholderText ? `<p>Stakeholder Audience: ${stakeholderText}</p>` : ''}
    </div>
</body>
</html>
`;
  }

  private async generateDOCXContent(report: GeneratedReport, options: ExportOptions): Promise<any[]> {
    const content: any[] = [];
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Add logo if available
    if (options.logoPath || options.useDefaultLogo) {
      try {
        const logoPath = options.logoPath || this.defaultLogoPath;
        if (fs.existsSync(logoPath)) {
          const logoBuffer = await this.processImageForDOCX(logoPath);
          content.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: {
                    width: 200,
                    height: 80,
                  },
                }),
              ],
            })
          );
        }
      } catch (error) {
        console.warn('Failed to add logo to DOCX:', error);
      }
    }

    // Title
    content.push(
      new Paragraph({
        text: report.organizationName,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: report.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    );

    // Stakeholder audience
    if (options.stakeholderAudience && options.stakeholderAudience.length > 0) {
      content.push(
        new Paragraph({
          text: "Stakeholder Audience",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: this.formatStakeholderAudience(options.stakeholderAudience),
        })
      );
    }

    // Report sections
    for (const section of report.sections) {
      content.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: section.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
        })
      );
    }

    // Footer
    content.push(
      new Paragraph({
        text: `This report was generated on ${currentDate} by AI DocWriter 4.0`,
        alignment: AlignmentType.CENTER,
      })
    );

    if (options.stakeholderAudience && options.stakeholderAudience.length > 0) {
      content.push(
        new Paragraph({
          text: `Stakeholder Audience: ${this.formatStakeholderAudience(options.stakeholderAudience)}`,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    return content;
  }

  private async getLogoAsBase64(options: ExportOptions): Promise<string | null> {
    try {
      let logoPath: string | null = null;
      
      if (options.logoPath && fs.existsSync(options.logoPath)) {
        logoPath = options.logoPath;
      } else if (options.useDefaultLogo && fs.existsSync(this.defaultLogoPath)) {
        logoPath = this.defaultLogoPath;
      }

      if (!logoPath) return null;

      // Process image with sharp to ensure it's web-compatible
      const processedImage = await sharp(logoPath)
        .resize(200, 80, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();

      return `data:image/png;base64,${processedImage.toString('base64')}`;
    } catch (error) {
      console.warn('Failed to process logo:', error);
      return null;
    }
  }

  private async processImageForDOCX(imagePath: string): Promise<Buffer> {
    return await sharp(imagePath)
      .resize(200, 80, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();
  }

  private formatStakeholderAudience(stakeholders?: string[]): string {
    if (!stakeholders || stakeholders.length === 0) return '';
    
    if (stakeholders.length === 1) return stakeholders[0];
    if (stakeholders.length === 2) return stakeholders.join(' and ');
    
    const lastStakeholder = stakeholders.pop();
    return stakeholders.join(', ') + ', and ' + lastStakeholder;
  }

  private formatContent(content: string): string {
    // Convert newlines to paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim());
    
    return paragraphs.map(paragraph => {
      // Check if it's a list item
      if (paragraph.trim().match(/^\d+\./)) {
        return `<li>${paragraph.replace(/^\d+\.\s*/, '')}</li>`;
      }
      // Check if it's a bullet point
      if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
        return `<li>${paragraph.replace(/^[•-]\s*/, '')}</li>`;
      }
      // Check if it contains key-value pairs
      if (paragraph.includes(':**') || paragraph.includes('**')) {
        const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<p>${formatted}</p>`;
      }
      return `<p>${paragraph}</p>`;
    }).join('');
  }
}