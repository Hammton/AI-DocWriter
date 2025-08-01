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
export declare class DocumentExporter {
    private defaultLogoPath;
    exportDocument(report: GeneratedReport, options: ExportOptions): Promise<Buffer>;
    private generatePDF;
    private generateDOCX;
    private generateHTMLWithLogo;
    private generateDOCXContent;
    private getLogoAsBase64;
    private processImageForDOCX;
    private formatStakeholderAudience;
    private formatContent;
}
//# sourceMappingURL=documentExporter.d.ts.map