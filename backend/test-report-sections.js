const { loadTemplate, generateReportContent } = require('./dist/services/reportGenerator');
const { mapApplicationDataToTemplate } = require('./dist/services/csvParser');

async function testReportSections() {
  try {
    console.log('Testing report sections generation...');
    
    // Test data
    const testApplicationData = {
      organization_name: 'AgroFuture',
      application_name: 'AgroFuture Connect',
      application_id: 'F1001',
      application_owner: 'Grace Kimani',
      application_category: 'Agritech Applications',
      application_tier: 'Tier 2',
      application_area: 'Agriculture',
      application_status: 'Active',
      business_owner: 'Agribusiness Unit',
      application_tco: '40000',
      application_capex: '60000',
      application_opex: '10000',
      application_vendor: 'TwigaTech',
      license_name: 'Agro Suite'
    };
    
    // Load template
    const template = await loadTemplate('application_profile');
    console.log('✅ Template loaded:', template.name);
    console.log('Template sections:', template.sections.length);
    
    // Generate mappings
    const templateMappings = mapApplicationDataToTemplate(testApplicationData);
    console.log('✅ Template mappings created');
    
    // Generate report
    const report = await generateReportContent(template, testApplicationData, templateMappings);
    console.log('✅ Report generated successfully!');
    console.log('Report ID:', report.id);
    console.log('Report sections:', report.sections.length);
    
    // Show sections
    report.sections.forEach((section, index) => {
      console.log(`Section ${index + 1}: ${section.title}`);
      console.log(`Content length: ${section.content.length} characters`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testReportSections();