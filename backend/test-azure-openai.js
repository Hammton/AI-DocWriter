const { AzureOpenAI } = require('openai');
require('dotenv').config();

async function testAzureOpenAI() {
  console.log('Testing Azure OpenAI connection...');
  
  // Check if all required environment variables are set
  const requiredVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_DEPLOYMENT_NAME'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return;
  }
  
  console.log('Environment variables check passed ✓');
  console.log('Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
  console.log('Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
  console.log('API Version:', process.env.AZURE_OPENAI_API_VERSION);
  
  try {
    const client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    });
    
    console.log('Azure OpenAI client created successfully ✓');
    
    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say "Hello from Azure OpenAI!" and confirm the integration is working.'
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    
    console.log('Azure OpenAI API call successful ✓');
    console.log('Response:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('Azure OpenAI test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAzureOpenAI();