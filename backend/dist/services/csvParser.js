"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSVFile = parseCSVFile;
exports.mapApplicationDataToTemplate = mapApplicationDataToTemplate;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
async function parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => {
            console.log('Raw CSV data:', data);
            if (data.application_name && data.application_name.trim()) {
                results.push(data);
            }
        })
            .on('end', () => {
            resolve(results);
        })
            .on('error', (error) => {
            reject(error);
        });
    });
}
function mapApplicationDataToTemplate(data) {
    const dependencies = [];
    if (data.dependency_1)
        dependencies.push(`${data.dependency_1} (${data.interface_type_1 ?? 'N/A'})`);
    if (data.dependency_2)
        dependencies.push(`${data.dependency_2} (${data.interface_type_2 ?? 'N/A'})`);
    if (data.dependency_3)
        dependencies.push(`${data.dependency_3} (${data.interface_type_3 ?? 'N/A'})`);
    if (data.dependency_4)
        dependencies.push(`${data.dependency_4} (${data.interface_type_4 ?? 'N/A'})`);
    return {
        application_name: data.application_name ?? 'Unnamed Application',
        application_description: data.application_description ?? 'No description provided.',
        application_status: data.application_status ?? 'Unknown',
        application_owner: data.application_owner ?? 'Not specified',
        business_owner: data.business_owner ?? 'Not specified',
        application_location: data.application_location ?? 'Not specified',
        application_category: data.application_category ?? 'Uncategorized',
        application_tier: data.application_tier ?? 'N/A',
        application_area: data.application_area ?? 'N/A',
        dependencies: dependencies.join(', ') || 'None',
        integration_points: dependencies.length > 0 ? `Integrates with ${dependencies.length} external systems` : 'No external integrations',
        dependency_list: dependencies.length > 0 ? dependencies.map((dep, index) => `${index + 1}. ${dep}`).join('\n') : 'No dependencies identified',
        context_information: `This application operates within ${data.organization_name ?? 'the organization'}'s technology landscape, serving as a ${(data.portal_type ?? 'portal').toLowerCase()}.`,
        tco: data.application_tco || '0',
        capex: data.application_capex || '0',
        opex: data.application_opex || '0',
        vendor: data.application_vendor || 'Not specified',
        license_info: data.license_name || 'Not specified',
        license_start: data.license_start_date || 'Not specified',
        license_end: data.license_end_date || 'Not specified',
        license_utilization: data.license_units_used && data.license_units
            ? `${data.license_units_used} of ${data.license_units} licenses used`
            : 'Not specified',
        capabilities: `This application supports core business operations within the ${data.application_area ?? 'relevant'} domain.`,
        recommendations: `Based on the analysis, consider monitoring license utilization (${data.license_status ?? 'N/A'}) and evaluating integration architecture for optimization opportunities.`
    };
}
//# sourceMappingURL=csvParser.js.map