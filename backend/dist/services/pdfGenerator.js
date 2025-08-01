"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDFFromHTML = generatePDFFromHTML;
exports.generateReportPDF = generateReportPDF;
exports.getGeneratedReportsDir = getGeneratedReportsDir;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function generatePDFFromHTML(htmlContent, outputPath) {
    let browser;
    try {
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
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
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
}
async function generateReportPDF(report) {
    const outputDir = path_1.default.join(__dirname, '../../data/generated');
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const sanitizedName = report.applicationName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_${report.metadata.applicationId}_${Date.now()}.pdf`;
    const outputPath = path_1.default.join(outputDir, filename);
    await generatePDFFromHTML(report.htmlContent, outputPath);
    return outputPath;
}
function getGeneratedReportsDir() {
    const outputDir = path_1.default.join(__dirname, '../../data/generated');
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    return outputDir;
}
//# sourceMappingURL=pdfGenerator.js.map