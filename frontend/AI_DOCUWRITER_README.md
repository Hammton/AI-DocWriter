# AI DocuWriter

A React TypeScript application for generating AI-powered documents based on enterprise architecture templates.

## Features

### 5-Step Workflow
1. **Select Domain** - Choose from lifecycle management domains (Proj, ALM, APM, DT 2.0 Design, DT 2.0 Deploy)
2. **Choose Template** - Pick from Standard Report, Executive Summary, or Detailed Analysis
3. **Enter Inputs** - Customize report parameters (title, dates, length, audience, etc.)
4. **Connect Data Source** - Select from Ardoq, Abacus, GraphDB, or Excel file upload
5. **Generate Document** - AI-powered report generation with progress tracking

### Key Components
- **WorkflowNavigation** - Progress indicator with step completion tracking
- **Domain Cards** - Interactive domain selection with icons and descriptions
- **Template Selection** - Visual template cards with page estimates
- **Form Customization** - Comprehensive report configuration options
- **Data Source Integration** - Multiple external data source options
- **Report Generation** - Simulated AI-powered document creation

### Tech Stack
- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Architecture

### State Management
The application uses Zustand for global state management with the following store:
- `workflowStore.ts` - Manages workflow progression, form data, and selections

### Component Structure
```
src/
├── components/
│   ├── Layout.tsx           # Main app layout
│   └── WorkflowNavigation.tsx # Progress indicator
├── pages/
│   ├── DomainSelection.tsx      # Step 1: Domain selection
│   ├── TemplateSelection.tsx    # Step 2: Template selection
│   ├── InputForm.tsx           # Step 3: Form customization
│   ├── DataSourceSelection.tsx # Step 4: Data source selection
│   └── ReportGeneration.tsx    # Step 5: Report generation
├── stores/
│   └── workflowStore.ts    # Zustand state management
└── types/
    └── index.ts           # TypeScript interfaces
```

### Data Types
The application includes comprehensive TypeScript interfaces for:
- Domain and lifecycle types
- Template configurations with placeholders
- Data source connections (Ardoq, Abacus, GraphDB, Excel)
- Workflow state management
- Report generation and status tracking
- Application Profile specific types (matching the ADIB example)

## Template System

The application supports three main template types:
1. **Standard Report** (12 pages avg) - General purpose reporting
2. **Executive Summary** (8 pages avg) - High-level leadership overview
3. **Detailed Analysis** (25 pages avg) - Comprehensive technical documentation

Each template includes:
- Placeholder mapping for dynamic content
- Required field validation
- Page length estimates
- Audience-specific formatting

## Data Source Integration

### Supported Sources
- **Ardoq** - Enterprise architecture platform
- **Abacus** - Business intelligence platform  
- **GraphDB** - Graph database for complex relationships
- **Excel File** - Direct spreadsheet upload

### Connection Management
- Secure credential storage
- Connection testing
- Data format standardization
- Error handling and retry logic

## Report Generation

The AI-powered report generation includes:
- Progress tracking with visual indicators
- Status updates (Preparing → Generating → Processing → Completed)
- Simulated AI content generation
- Download functionality for completed reports
- Error handling and recovery

## Customization Options

Users can customize reports with:
- Document title and reporting period
- Estimated length (pages)
- Executive summary inclusion
- Logo selection (default or custom)
- Stakeholder audience targeting
- Special instructions and focus areas

## Future Enhancements

- Real AI integration (Claude API, OpenAI, etc.)
- Actual file upload and processing
- Live data source connections
- Template editor and customization
- Report history and management
- User authentication and permissions
- Export to multiple formats (PDF, DOCX, HTML)
- Batch report generation
- Advanced analytics and reporting

## Development

### Project Structure
The application follows React best practices with:
- Component separation and modularity
- TypeScript for type safety
- Custom hooks for reusable logic
- Proper state management patterns
- Responsive design principles

### Styling
Uses TailwindCSS for:
- Consistent design system
- Responsive breakpoints
- Custom color palette
- Component utilities
- Professional UI components

This application provides a solid foundation for enterprise document generation with a clean, professional interface that matches modern web application standards.