# Azure OpenAI Migration Guide

This document outlines the changes made to migrate from OpenAI API to Azure OpenAI API.

## Changes Made

### 1. Environment Variables
**Before:**
```env
OPENAI_API_KEY=sk-proj-...
```

**After:**
```env
AZURE_OPENAI_API_KEY=BaILIpDCFlyXTXXWXQWw5Kxpj6cwpJ4fkTNhJbY2Kj9QmpH4a83VJQQJ99ALACfhMk5XJ3w3AAAAACOGOmml
AZURE_OPENAI_ENDPOINT=https://samwe-m4r3zeki-swedencentral.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-32k
```

### 2. Code Changes

#### backend/src/services/reportGenerator.ts
- **Import Change:** `import OpenAI from 'openai'` → `import { AzureOpenAI } from 'openai'`
- **Client Variable:** `openai: OpenAI` → `azureOpenAI: AzureOpenAI`
- **Function Name:** `getOpenAIClient()` → `getAzureOpenAIClient()`
- **Client Configuration:** Updated to use Azure-specific parameters
- **Model Reference:** Changed from `'gpt-4'` to `process.env.AZURE_OPENAI_DEPLOYMENT_NAME`

#### backend/src/app.ts
- **Environment Check:** `hasOpenAIKey: !!process.env.OPENAI_API_KEY` → `hasAzureOpenAIKey: !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT)`
- **Variable Reference:** `openAIKeyExists` → `azureOpenAIKeyExists`

### 3. Key Differences Between OpenAI and Azure OpenAI

| Feature | OpenAI | Azure OpenAI |
|---------|--------|--------------|
| Authentication | API Key only | API Key + Endpoint |
| Model Reference | Model name (e.g., 'gpt-4') | Deployment name |
| API Version | Not required | Required |
| Endpoint | Fixed (api.openai.com) | Custom Azure endpoint |

### 4. Testing

A test script has been created at `backend/test-azure-openai.js` to verify the Azure OpenAI integration.

**To run the test:**
```bash
cd backend
node test-azure-openai.js
```

### 5. Configuration Requirements

Ensure your Azure OpenAI resource has:
1. A deployment named `gpt-4-32k` (or update `AZURE_OPENAI_DEPLOYMENT_NAME`)
2. The correct API version (`2024-02-15-preview` or newer)
3. Proper access permissions for the API key

### 6. Benefits of Azure OpenAI

- **Enterprise Security:** Better compliance and security features
- **Data Residency:** Data stays within your Azure region
- **Integration:** Better integration with other Azure services
- **Cost Management:** Azure billing and cost management tools
- **SLA:** Enterprise-grade service level agreements

## Next Steps

1. Update your `.env` file with the correct Azure OpenAI credentials
2. Run the test script to verify connectivity
3. Test the report generation functionality
4. Monitor logs for any issues during the transition

## Troubleshooting

Common issues and solutions:

1. **Authentication Error:** Verify API key and endpoint are correct
2. **Model Not Found:** Ensure deployment name matches your Azure OpenAI deployment
3. **Rate Limiting:** Check your Azure OpenAI quota and rate limits
4. **Network Issues:** Verify firewall/network access to Azure endpoints