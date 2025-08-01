// Domain and Lifecycle Types
export const DomainType = {
  LIFECYCLE_PROJ: 'lifecycle_proj',
  LIFECYCLE_ALM: 'lifecycle_alm',
  LIFECYCLE_APM: 'lifecycle_apm',
  LIFECYCLE_DT_DESIGN: 'lifecycle_dt_design',
  LIFECYCLE_DT_DEPLOY: 'lifecycle_dt_deploy'
} as const

export type DomainType = typeof DomainType[keyof typeof DomainType]

export interface Domain {
  id: string;
  type: DomainType;
  name: string;
  description: string;
  icon: string;
}

// Template Types
export const TemplateType = {
  APPLICATION_PROFILE: 'application_profile',
  BUSINESS_PROFILE: 'business_profile',
  DEMAND_ARCHITECTURE: 'demand_architecture'
} as const

export type TemplateType = typeof TemplateType[keyof typeof TemplateType]

export interface Template {
  id: string;
  type: TemplateType;
  name: string;
  description: string;
  avgPages: number;
  icon: string;
  placeholders: string[];
  requiredFields: string[];
}

// Data Source Types
export const DataSourceType = {
  ARDOQ: 'ardoq',
  ABACUS: 'abacus',
  GRAPHDB: 'graphdb',
  EXCEL_FILE: 'excel_file'
} as const

export type DataSourceType = typeof DataSourceType[keyof typeof DataSourceType]

export interface DataSource {
  id: string;
  type: DataSourceType;
  name: string;
  description: string;
  icon: string;
  connectionRequired: boolean;
}

export interface ExternalApiCredentials {
  id: string;
  name: string;
  type: DataSourceType;
  endpoint?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  isActive: boolean;
  lastTested?: Date;
}

// Workflow Types
export const WorkflowStep = {
  SELECT_DOMAIN: 1,
  CHOOSE_TEMPLATE: 2,
  ENTER_INPUTS: 3,
  CONNECT_DATA_SOURCE: 4,
  GENERATE_DOCUMENT: 5
} as const

export type WorkflowStep = typeof WorkflowStep[keyof typeof WorkflowStep]

export interface WorkflowState {
  currentStep: WorkflowStep;
  selectedDomain?: Domain;
  selectedTemplate?: Template;
  formData: Record<string, any>;
  selectedDataSource?: DataSource;
  isComplete: boolean;
}

// Form and Input Types
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'toggle';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface ReportConfiguration {
  documentTitle: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  estimatedLength: number;
  includeExecutiveSummary: boolean;
  logo: 'default' | 'custom';
  stakeholderAudience: string[];
  specialInstructions?: string;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  data?: any;
  preview?: string;
}

// Report Generation Types
export const GenerationStatus = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  GENERATING: 'generating',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const

export type GenerationStatus = typeof GenerationStatus[keyof typeof GenerationStatus]

export interface GenerationJob {
  id: string;
  status: GenerationStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  result?: GeneratedReport;
}

export interface GeneratedReport {
  id: string;
  title: string;
  content: string;
  format: 'pdf' | 'docx' | 'html';
  generatedAt: Date;
  template: Template;
  dataSource: DataSource;
  downloadUrl?: string;
}

// Application Profile Specific Types (based on the PDF)
export interface ApplicationProfile {
  applicationName: string;
  applicationDescription: string;
  applicationStatus: 'Active' | 'Inactive' | 'Deprecated';
  applicationCategory: string;
  applicationTier: string;
  applicationArea: string;
  applicationOwner: string;
  applicationStreamLeader: string;
  applicationBusinessOwner: string;
  applicationLocation: string;
  dependencies: ApplicationDependency[];
  footprint: ApplicationFootprint;
}

export interface ApplicationDependency {
  applicationName: string;
  interfaceType: 'ESB' | 'ETL (BDM)' | 'API' | 'Database';
}

export interface ApplicationFootprint {
  tco: number;
  capex: number;
  opex: number;
  vendor: string;
  license: string;
  licenseStartDate: string;
  licenseEndDate: string;
  licenseUnits: number;
  licenseUnitsUtilized: number;
  licenseUsage: string;
}

// Error Types
export interface AppError {
  id: string;
  message: string;
  type: 'validation' | 'network' | 'generation' | 'system';
  timestamp: Date;
  context?: Record<string, any>;
}

// Navigation Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current: boolean;
}