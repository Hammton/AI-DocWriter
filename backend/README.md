# AI DocuWriter Backend

This folder will contain the backend API for the AI DocuWriter application.

## Planned Architecture

### Technology Stack
- **Node.js** with Express.js or **Python** with FastAPI
- **Database**: PostgreSQL or MongoDB
- **AI Integration**: Claude API, OpenAI API
- **File Processing**: PDF generation, DOCX creation
- **Authentication**: JWT tokens
- **External APIs**: Ardoq, Abacus, GraphDB connectors

### API Endpoints (Planned)

#### Authentication
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/refresh`

#### Templates
- GET `/api/templates`
- GET `/api/templates/:id`
- POST `/api/templates`
- PUT `/api/templates/:id`

#### Data Sources
- GET `/api/data-sources`
- POST `/api/data-sources/test-connection`
- POST `/api/data-sources/ardoq/connect`
- POST `/api/data-sources/abacus/connect`
- POST `/api/data-sources/graphdb/connect`

#### File Management
- POST `/api/files/upload`
- GET `/api/files/:id`
- DELETE `/api/files/:id`

#### Report Generation
- POST `/api/reports/generate`
- GET `/api/reports/:id/status`
- GET `/api/reports/:id/download`
- GET `/api/reports/history`

#### AI Integration
- POST `/api/ai/generate-content`
- POST `/api/ai/process-template`

### Database Schema (Planned)

#### Users
- id, email, password_hash, created_at, updated_at

#### Templates
- id, name, type, content, placeholders, created_at, updated_at

#### Reports
- id, user_id, template_id, title, status, content, created_at, updated_at

#### Data Sources
- id, user_id, type, name, connection_config, is_active, created_at, updated_at

#### Files
- id, user_id, filename, file_path, file_type, file_size, created_at

## Getting Started (Future)

1. Choose backend framework (Node.js/Express or Python/FastAPI)
2. Set up database (PostgreSQL/MongoDB)
3. Implement authentication system
4. Create API endpoints
5. Integrate with AI services
6. Add external data source connectors
7. Implement file processing and report generation

## Current Status

This is a placeholder structure. The backend will be implemented in future development phases.