// Marketing Automation Types

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type CampaignType = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type EmailStatus = 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'UNSUBSCRIBED';

export interface CampaignResponse {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string;
  content: string;
  recipientList?: string[];
  segmentId?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  stats?: CampaignStats;
}

export interface CampaignStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
}

export interface CreateCampaignRequest {
  name: string;
  type: CampaignType;
  subject?: string;
  content: string;
  recipientList?: string[];
  segmentId?: string;
  scheduledAt?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  content?: string;
  status?: CampaignStatus;
  scheduledAt?: string;
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'EVENT' | 'WEBHOOK' | 'SCHEDULE' | 'MANUAL';
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'ACTION' | 'CONDITION' | 'DELAY' | 'LOOP';
  config: Record<string, any>;
  nextSteps?: string[];
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
}

export interface LandingPageResponse {
  id: string;
  name: string;
  url: string;
  content: string;
  isPublished: boolean;
  conversionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingPageRequest {
  name: string;
  content: string;
}

