import { AzureOpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { ApplicationData, mapApplicationDataToTemplate } from './csvParser';

let azureOpenAI: AzureOpenAI | null = null;

function getAzureOpenAIClient(): AzureOpenAI | null {
  if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
    return null;
  }
  if (!azureOpenAI) {
    azureOpenAI = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    });
  }
  return azureOpenAI;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  avgPages: number;
  sections: Array<{
    title: string;
    content: string;
  }>;
  placeholders: string[];
}

export interface GeneratedReport {
  id: string;
  title: string;
  applicationName: string;
  organizationName: string;
  htmlContent: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  metadata: {
    templateId: string;
    generatedAt: string;
    applicationId: string;
  };
}

export async function loadTemplate(templateId: string): Promise<ReportTemplate> {
  // Try the template ID as-is first
  let templatePath = path.join(__dirname, '../../data/templates', `${templateId}.json`);

  // If not found, try with underscores replaced by hyphens
  if (!fs.existsSync(templatePath)) {
    const sanitizedTemplateId = templateId.replace(/_/g, '-');
    templatePath = path.join(__dirname, '../../data/templates', `${sanitizedTemplateId}.json`);
  }

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template ${templateId} not found`);
  }

  const templateContent = fs.readFileSync(templatePath, 'utf8');
  return JSON.parse(templateContent);
}

export async function generateReportContent(
  template: ReportTemplate,
  applicationData: ApplicationData,
  templateMappings: Record<string, string>,
  options?: {
    stakeholderAudience?: string[];
    customInstructions?: string;
  }
): Promise<GeneratedReport> {
  const sections = [];

  for (const section of template.sections) {
    let content = section.content;

    // Replace placeholders with actual data
    for (const [placeholder, value] of Object.entries(templateMappings)) {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      content = content.replace(regex, value);
    }

    // Use Azure OpenAI to enhance the content if it's still templated and API key is available
    const azureOpenAIClient = getAzureOpenAIClient();
    if (azureOpenAIClient && (content.includes('{') || content.length < 100)) {
      try {
        const enhancedContent = await enhanceContentWithAI(section.title, content, applicationData);
        content = enhancedContent;
      } catch (error) {
        console.warn(`AI enhancement failed for section ${section.title}, using template content:`, error instanceof Error ? error.message : 'Unknown error');
        // Keep original content if AI enhancement fails
      }
    } else if (!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) && (content.includes('{') || content.length < 100)) {
      // Fallback: Generate basic professional content without AI
      content = generateBasicContent(section.title, applicationData);
    }

    sections.push({
      title: section.title,
      content: content
    });
  }

  const htmlContent = generateHTMLReport(template, sections, applicationData, options);

  return {
    id: `${applicationData.application_id}-${Date.now()}`,
    title: `${template.name} - ${applicationData.application_name}`,
    applicationName: applicationData.application_name,
    organizationName: applicationData.organization_name,
    htmlContent,
    sections,
    metadata: {
      templateId: template.id,
      generatedAt: new Date().toISOString(),
      applicationId: applicationData.application_id
    }
  };
}

function generateBasicContent(sectionTitle: string, applicationData: ApplicationData): string {
  switch (sectionTitle.toLowerCase()) {
    case 'executive summary':
      return `This report provides a comprehensive analysis of ${applicationData.application_name}, a ${applicationData.application_category.toLowerCase()} maintained by ${applicationData.organization_name}. The application serves as a critical component of the organization's technology infrastructure, supporting business operations within the ${applicationData.application_area} domain. This analysis covers technical architecture, dependencies, financial considerations, and strategic recommendations for ongoing optimization and enhancement.`;

    case 'technical architecture':
      return `${applicationData.application_name} is classified as a ${applicationData.application_tier} application within the ${applicationData.application_category} category. The system operates within the ${applicationData.application_area} area and is owned by ${applicationData.application_owner}. The application integrates with multiple external systems to provide comprehensive functionality and supports the organization's operational requirements through robust technical architecture and established integration patterns.`;

    case 'dependencies':
      return `This application maintains strategic integrations with several key systems within ${applicationData.organization_name}'s technology landscape. These dependencies are critical for the application's functionality and represent important considerations for maintenance, upgrades, and business continuity planning. The integration architecture follows enterprise standards and best practices for data exchange and system interoperability.`;

    case 'context model':
      return `${applicationData.application_name} operates within ${applicationData.organization_name}'s broader technology ecosystem, serving users and interfacing with complementary systems. The application's context encompasses both internal organizational systems and external service providers, creating a comprehensive operational environment that supports business objectives and user requirements.`;

    case 'footprint':
      return `The financial footprint of ${applicationData.application_name} includes total cost of ownership considerations, licensing arrangements, and operational expenditures. The application is supported by ${applicationData.application_vendor} with licensing managed according to organizational standards. Current license utilization and renewal schedules are monitored to ensure optimal cost management and compliance with vendor agreements.`;

    case 'capability automation':
      return `${applicationData.application_name} provides automated support for key business capabilities within ${applicationData.organization_name}. The application streamlines operational processes, reduces manual effort, and enables scalable business operations. Through its automated capabilities, the system contributes to organizational efficiency and supports strategic business objectives within the ${applicationData.application_area} domain.`;

    case 'recommendations':
      return `Based on the analysis of ${applicationData.application_name}, several strategic recommendations emerge for optimization and enhancement. These recommendations focus on maintaining system performance, optimizing integration architecture, managing licensing costs effectively, and ensuring alignment with evolving business requirements. Regular review and assessment of these recommendations will support continued value delivery and operational excellence.`;

    default:
      return `This section provides detailed information about ${sectionTitle.toLowerCase()} for ${applicationData.application_name}. The application, maintained by ${applicationData.organization_name}, represents a key component of the organization's technology infrastructure and supports critical business operations within the ${applicationData.application_area} domain.`;
  }
}

async function enhanceContentWithAI(sectionTitle: string, content: string, applicationData: ApplicationData): Promise<string> {
  const client = getAzureOpenAIClient();
  if (!client) {
    return content;
  }

  try {
    const prompt = `
You are an enterprise architect creating a professional ${sectionTitle} section for an application profile report.

Application Details:
- Name: ${applicationData.application_name}
- Description: ${applicationData.application_description}
- Organization: ${applicationData.organization_name}
- Owner: ${applicationData.application_owner}
- Category: ${applicationData.application_category}
- Tier: ${applicationData.application_tier}

Current content template:
${content}

Please enhance this content to be more detailed, professional, and specific to this application. Maintain the same structure but expand with relevant technical and business insights. Keep it concise but informative (2-3 paragraphs maximum).

Return only the enhanced content, no additional formatting or explanations.
`;

    console.log(`Enhancing content for section: ${sectionTitle}`);
    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4-32k',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      console.log(`Successfully enhanced content for section: ${sectionTitle}`);
      return response.choices[0].message.content || content;
    } else {
      console.warn(`AI enhancement failed for ${sectionTitle}: Invalid response structure`);
      return content;
    }
  } catch (error) {
    console.error(`AI enhancement failed for ${sectionTitle}:`, error);
    return content;
  }
}

function generateHTMLReport(template: ReportTemplate, sections: Array<{ title: string, content: string }>, applicationData: ApplicationData, options?: { stakeholderAudience?: string[]; customInstructions?: string; }): string {
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
    <title>${template.name} - ${applicationData.application_name}</title>
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
        @media print {
            body { margin: 0; padding: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">${applicationData.organization_name}</div>
        <h1 class="report-title">${template.name}</h1>
        <div class="subtitle">Developed for ${applicationData.application_name}</div>
        <div class="subtitle">Application Owner: ${applicationData.application_owner}</div>
        <div class="subtitle">Report Owner: Enterprise Architecture</div>
    </div>

    <div class="metadata">
        <h3>Report Information</h3>
        <table class="table">
            <tr><td><strong>Application ID:</strong></td><td>${applicationData.application_id}</td></tr>
            <tr><td><strong>Application Name:</strong></td><td>${applicationData.application_name}</td></tr>
            <tr><td><strong>Organization:</strong></td><td>${applicationData.organization_name}</td></tr>
            <tr><td><strong>Status:</strong></td><td><span class="highlight">${applicationData.application_status}</span></td></tr>
            <tr><td><strong>Generated Date:</strong></td><td>${currentDate}</td></tr>
            <tr><td><strong>Template:</strong></td><td>${template.name}</td></tr>
        </table>
    </div>

    ${sections.map(section => `
        <div class="section">
            <h2 class="section-title">${section.title}</h2>
            <div class="section-content">
                ${formatContent(section.content)}
            </div>
        </div>
    `).join('')}

    <div class="footer">
        <p>This report was generated on ${currentDate} by AI DocWriter 4.0</p>
        <p>Stakeholder Audience: ${options?.stakeholderAudience?.join(', ') || 'General'}</p>
    </div>
</body>
</html>
`;
}

function formatContent(content: string): string {
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