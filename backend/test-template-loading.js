const { loadTemplate } = require('./dist/services/reportGenerator');

async function testTemplateLoading() {
  try {
    console.log('Testing template loading...');
    
    const template = await loadTemplate('application_profile');
    console.log('✅ Template loaded successfully!');
    console.log('Template name:', template.name);
    console.log('Template sections:', template.sections.length);
    console.log('Template placeholders:', template.placeholders.length);
    
  } catch (error) {
    console.error('❌ Template loading failed:', error.message);
  }
}

testTemplateLoading();