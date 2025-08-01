import fs from 'fs';
import csvParser from 'csv-parser';

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

export async function parseCSVFile(filePath: string): Promise<ApplicationData[]> {
  return new Promise((resolve, reject) => {
    const results: ApplicationData[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data: ApplicationData) => {
        console.log('Raw CSV data:', data);
        // Only add non-empty rows
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

export function mapApplicationDataToTemplate(data: ApplicationData): Record<string, string> {
  // Create dependency list
  const dependencies = [];
  if (data.dependency_1) dependencies.push(`${data.dependency_1} (${data.interface_type_1 ?? 'N/A'})`);
  if (data.dependency_2) dependencies.push(`${data.dependency_2} (${data.interface_type_2 ?? 'N/A'})`);
  if (data.dependency_3) dependencies.push(`${data.dependency_3} (${data.interface_type_3 ?? 'N/A'})`);
  if (data.dependency_4) dependencies.push(`${data.dependency_4} (${data.interface_type_4 ?? 'N/A'})`);

  return {
    // Basic application information
    application_name: data.application_name ?? 'Unnamed Application',
    application_description: data.application_description ?? 'No description provided.',
    application_status: data.application_status ?? 'Unknown',
    application_owner: data.application_owner ?? 'Not specified',
    business_owner: data.business_owner ?? 'Not specified',
    application_location: data.application_location ?? 'Not specified',
    application_category: data.application_category ?? 'Uncategorized',
    application_tier: data.application_tier ?? 'N/A',
    application_area: data.application_area ?? 'N/A',
    
    // Dependencies
    dependencies: dependencies.join(', ') || 'None',
    integration_points: dependencies.length > 0 ? `Integrates with ${dependencies.length} external systems` : 'No external integrations',
    dependency_list: dependencies.length > 0 ? dependencies.map((dep, index) => `${index + 1}. ${dep}`).join('\n') : 'No dependencies identified',
    
    // Context information
    context_information: `This application operates within ${data.organization_name ?? 'the organization'}'s technology landscape, serving as a ${(data.portal_type ?? 'portal').toLowerCase()}.`,
    
    // Financial information
    tco: data.application_tco || '0',
    capex: data.application_capex || '0',
    opex: data.application_opex || '0',
    vendor: data.application_vendor || 'Not specified',
    
    // Licensing
    license_info: data.license_name || 'Not specified',
    license_start: data.license_start_date || 'Not specified',
    license_end: data.license_end_date || 'Not specified',
    license_utilization: data.license_units_used && data.license_units 
      ? `${data.license_units_used} of ${data.license_units} licenses used`
      : 'Not specified',
    
    // Additional fields
    capabilities: `This application supports core business operations within the ${data.application_area ?? 'relevant'} domain.`,
    recommendations: `Based on the analysis, consider monitoring license utilization (${data.license_status ?? 'N/A'}) and evaluating integration architecture for optimization opportunities.`
  };
}