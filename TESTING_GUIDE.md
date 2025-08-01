# AI DocuWriter - Complete Testing Guide

## Overview
This guide will help you test the entire AI DocuWriter application, including backend API and frontend React application.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- OpenAI API key (already configured in your .env file)

## Step 1: Test Backend Setup

### 1.1 Install Backend Dependencies
```bash
cd backend
npm install
```

### 1.2 Build TypeScript
```bash
npm run build
```

### 1.3 Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

### 1.4 Verify Backend is Running
- Server should start on: http://localhost:3001
- You should see console messages:
  ```
  🚀 AI DocuWriter Backend running on port 3001
  📋 Templates available at http://localhost:3001/api/templates
  ❤️  Health check at http://localhost:3001/api/health
  ```

## Step 2: Test Backend API Endpoints

### 2.1 Health Check
Open browser or use curl:
```bash
curl http://localhost:3001/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "templates": {
    "application": true,
    "business": true,
    "demand": true
  }
}
```

### 2.2 List Templates
```bash
curl http://localhost:3001/api/templates
```
Expected response:
```json
{
  "templates": [
    {
      "id": "application_profile",
      "name": "Application Profile Report",
      "description": "Comprehensive application architecture documentation",
      "avgPages": 12
    },
    {
      "id": "business_profile", 
      "name": "Business Profile Report",
      "description": "Comprehensive business division profile covering structure, capabilities, and cost analysis",
      "avgPages": 7
    },
    {
      "id": "demand_profile",
      "name": "Demand Architecture Profile Report", 
      "description": "Assessment of incoming demands to determine architectural feasibility, business impact and change implications",
      "avgPages": 10
    }
  ]
}
```

### 2.3 Get Specific Template
```bash
curl http://localhost:3001/api/templates/application_profile
```
Should return the full template JSON structure.

### 2.4 Test Report Generation Endpoint
```bash
curl -X POST http://localhost:3001/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "application_profile",
    "data": {
      "application_name": "Test App",
      "application_description": "Test Description"
    }
  }'
```

## Step 3: Test Frontend Setup

### 3.1 Install Frontend Dependencies
Open a new terminal:
```bash
cd frontend
npm install
```

### 3.2 Start Frontend Development Server
```bash
npm run dev
```

### 3.3 Verify Frontend is Running
- Frontend should start on: http://localhost:5173
- Browser should automatically open
- You should see the AI DocuWriter interface

## Step 4: End-to-End Testing

### 4.1 Test Navigation
1. Visit http://localhost:5173
2. Navigate through different pages:
   - Data Source Selection
   - Domain Selection  
   - Template Selection
   - Input Form
   - Report Generation

### 4.2 Test Template Selection
1. Go to Template Selection page
2. Verify all 3 templates appear:
   - Application Profile Report
   - Business Profile Report
   - Demand Architecture Profile Report
3. Select each template and verify details load

### 4.3 Test API Integration
1. Open browser developer tools (F12)
2. Go to Network tab
3. Navigate through the app
4. Verify API calls to backend are working:
   - GET /api/templates
   - GET /api/templates/:id

## Step 5: Common Issues & Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Find and kill process using port 3001
npx kill-port 3001
```

#### TypeScript Build Errors
```bash
cd backend
rm -rf dist node_modules
npm install
npm run build
```

#### Missing Templates
Verify files exist:
- `backend/data/templates/application-profile.json`
- `backend/data/templates/business-profile.json` 
- `backend/data/templates/demand-profile.json`

### Frontend Issues

#### Port Conflicts
If port 5173 is in use, Vite will automatically try 5174, 5175, etc.

#### API Connection Issues
1. Verify backend is running on port 3001
2. Check CORS settings in backend
3. Verify frontend is making requests to correct URL

#### Build Issues
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

## Step 6: Production Testing

### 6.1 Build Frontend for Production
```bash
cd frontend
npm run build
```

### 6.2 Preview Production Build
```bash
npm run preview
```

### 6.3 Test Production Backend
```bash
cd backend
npm run build
npm start
```

## Step 7: API Testing with Postman/Insomnia

Import this collection for comprehensive API testing:

### Collection: AI DocuWriter API Tests

1. **Health Check**
   - GET http://localhost:3001/api/health

2. **List Templates**
   - GET http://localhost:3001/api/templates

3. **Get Application Template**
   - GET http://localhost:3001/api/templates/application_profile

4. **Get Business Template**
   - GET http://localhost:3001/api/templates/business_profile

5. **Get Demand Template**
   - GET http://localhost:3001/api/templates/demand_profile

6. **Generate Report**
   - POST http://localhost:3001/api/generate-report
   - Body (JSON):
   ```json
   {
     "templateId": "application_profile",
     "data": {
       "application_name": "Sample Application",
       "application_description": "Test application for report generation"
     }
   }
   ```

## Success Criteria

✅ Backend starts without errors on port 3001
✅ All API endpoints return expected responses
✅ Frontend starts without errors on port 5173  
✅ Frontend can fetch and display templates
✅ Navigation between pages works smoothly
✅ No console errors in browser developer tools
✅ Templates are properly formatted and contain all sections
✅ Mock report generation returns success response

## Next Steps

Once basic testing is complete, you can:

1. **Integrate OpenAI API** - Replace mock report generation with actual AI processing
2. **Add File Upload** - Implement file upload functionality for data sources
3. **Add Authentication** - Implement user authentication if needed
4. **Add Database** - Store generated reports and user data
5. **Deploy** - Deploy to production environment

## Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure ports 3001 and 5173 are available
4. Check that all template files exist and are valid JSON
5. Verify environment variables are properly set