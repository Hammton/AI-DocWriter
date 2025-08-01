import { ApplicationData } from './csvParser';
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
export declare function loadTemplate(templateId: string): Promise<ReportTemplate>;
export declare function generateReportContent(template: ReportTemplate, applicationData: ApplicationData, templateMappings: Record<string, string>, options?: {
    stakeholderAudience?: string[];
    customInstructions?: string;
}): Promise<GeneratedReport>;
//# sourceMappingURL=reportGenerator.d.ts.map