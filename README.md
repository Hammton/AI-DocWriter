# AI DocuWriter

A full-stack application for generating AI-powered enterprise architecture documents.

## Project Structure

```
AI Docuwriter/
├── frontend/          # React TypeScript frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── stores/        # Zustand state management
│   │   ├── types/         # TypeScript interfaces
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
│   ├── public/
│   │   └── dq-logo.png   # DQ logo asset
│   └── package.json
├── backend/           # Backend API (planned)
│   └── README.md      # Backend architecture documentation
└── README.md          # This file
```

## Frontend Application

### Features
- **5-Step Workflow**: Domain → Template → Inputs → Data Source → Generate
- **Template Types**: Application Profile, Business Profile, Demand Architecture
- **Logo System**: DQ default logo with custom upload option
- **Data Sources**: Ardoq, Abacus, GraphDB, Excel file upload
- **AI Simulation**: Progress tracking for report generation

### Tech Stack
- React 19 with TypeScript
- Vite for development and building
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation
- Lucide React for icons

### Getting Started

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Backend (Planned)

The backend will provide:
- REST API endpoints
- User authentication
- Template management
- AI integration (Claude API)
- External data source connectors
- File processing and report generation

See `/backend/README.md` for detailed backend architecture plans.

## Current Status

- ✅ **Frontend**: Complete with all requested features
- 🔄 **Backend**: Architecture planned, implementation pending

## Key Features Implemented

### 1. Updated Template Names
- Application Profile Report
- Business Profile Report  
- Demand Architecture Profile

### 2. Auto-populated Document Title
- Document title automatically fills with selected template name
- Users can still customize if needed

### 3. Enhanced Logo System
- DQ logo integration in header and form
- Custom logo upload with file validation
- Image preview functionality
- Remove/replace uploaded logos

### 4. Professional UI/UX
- Clean, modern interface matching mockups
- Responsive design for all screen sizes
- Progress tracking through workflow steps
- Professional color scheme and typography

## Development

The application is ready for development and can be extended with:
- Real AI integration
- Backend API development
- Database integration
- User authentication
- Advanced template processing
- Production deployment

Visit the frontend application at `http://localhost:5176` (or current port) to see all features in action.