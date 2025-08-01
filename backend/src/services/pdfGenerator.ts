import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { GeneratedReport } from './reportGenerator';

export async function generatePDFFromHTML(htmlContent: string, outputPath: string): Promise<void> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for any resources to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with proper formatting
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      displayHeaderFooter: false,
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function generateReportPDF(report: GeneratedReport): Promise<string> {
  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../../data/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate filename
  const sanitizedName = report.applicationName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${sanitizedName}_${report.metadata.applicationId}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, filename);
  
  // Generate PDF
  await generatePDFFromHTML(report.htmlContent, outputPath);
  
  return outputPath;
}

export function getGeneratedReportsDir(): string {
  const outputDir = path.join(__dirname, '../../data/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}