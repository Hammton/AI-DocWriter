export interface ApplicationData {
    organization_name: string;
    portal_type: string;
    application_owner: string;
    report_owner: string;
    application_id: string;
    application_name: string;
    application_description: string;
    application_status: string;
    application_category: string;
    application_tier: string;
    application_area: string;
    stream_leader: string;
    business_owner: string;
    application_location: string;
    dependency_1: string;
    interface_type_1: string;
    dependency_2: string;
    interface_type_2: string;
    dependency_3: string;
    interface_type_3: string;
    dependency_4: string;
    interface_type_4: string;
    application_tco: string;
    application_capex: string;
    application_opex: string;
    application_vendor: string;
    license_name: string;
    license_start_date: string;
    license_end_date: string;
    license_units: string;
    license_units_used: string;
    license_status: string;
}
export declare function parseCSVFile(filePath: string): Promise<ApplicationData[]>;
export declare function mapApplicationDataToTemplate(data: ApplicationData): Record<string, string>;
//# sourceMappingURL=csvParser.d.ts.map