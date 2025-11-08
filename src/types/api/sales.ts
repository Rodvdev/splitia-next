// Sales Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type OpportunityStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type LeadSource =
  | 'WEB'
  | 'REFERRAL'
  | 'EVENT'
  | 'SOCIAL_MEDIA'
  | 'OTHER';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'CONVERTED'
  | 'LOST';

export type ActivityType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'NOTE';

// Opportunity Response según backend
export interface OpportunityResponse {
  id: string; // UUID
  name: string;
  description?: string;
  estimatedValue: number;
  probability: number; // 0-100
  stage: OpportunityStage;
  expectedCloseDate?: string; // ISO 8601 date
  actualCloseDate?: string | null; // ISO 8601 date
  wonAmount?: number | null;
  lostReason?: string | null;
  currency: string;
  assignedToId?: string; // UUID
  assignedToName?: string;
  contactId?: string; // UUID
  contactName?: string;
  companyId?: string; // UUID
  companyName?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateOpportunityRequest {
  name: string;
  description?: string;
  estimatedValue: number;
  probability?: number; // Default: 0
  stage?: OpportunityStage; // Default: 'LEAD'
  expectedCloseDate?: string;
  assignedToId?: string;
  contactId?: string;
  companyId?: string;
  currency?: string; // Default: 'USD'
}

export interface UpdateOpportunityRequest {
  name?: string;
  description?: string;
  estimatedValue?: number;
  probability?: number;
  stage?: OpportunityStage;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  wonAmount?: number;
  lostReason?: string;
  assignedToId?: string;
  contactId?: string;
  companyId?: string;
  currency?: string;
}

// Lead Response según backend
export interface LeadResponse {
  id: string; // UUID
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  score?: number; // 0-100
  assignedToId?: string; // UUID
  assignedToName?: string;
  contactId?: string; // UUID
  contactName?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status?: LeadStatus; // Default: 'NEW'
  score?: number;
  assignedToId?: string;
  contactId?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  status?: LeadStatus;
  score?: number;
  assignedToId?: string;
  contactId?: string;
}

// Activity Response según backend
export interface ActivityResponse {
  id: string; // UUID
  type: ActivityType;
  subject: string;
  description?: string;
  dueDate?: string; // ISO 8601 date
  completed: boolean;
  completedAt?: string | null; // ISO 8601 datetime
  opportunityId?: string; // UUID
  leadId?: string; // UUID
  createdById?: string; // UUID
  createdByName?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateActivityRequest {
  type: ActivityType;
  subject: string;
  description?: string;
  dueDate?: string;
  opportunityId?: string;
  leadId?: string;
}

export interface UpdateActivityRequest {
  type?: ActivityType;
  subject?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  opportunityId?: string;
  leadId?: string;
}

// Pipeline Response según backend
export interface PipelineResponse {
  [key: string]: OpportunityResponse[]; // Agrupado por stage
}

// Forecasting Response según backend
export interface ForecastingResponse {
  period: string; // 'MONTH' | 'QUARTER' | 'YEAR'
  forecastedRevenue: number;
  weightedForecast: number;
  byStage: {
    LEAD?: number;
    QUALIFIED?: number;
    PROPOSAL?: number;
    NEGOTIATION?: number;
  };
}

// Sales Metrics Response según backend
export interface SalesMetricsResponse {
  totalOpportunities: number;
  totalValue: number;
  winRate: number; // 0-1
  averageDealSize: number;
  averageSalesCycle: number; // días
}
