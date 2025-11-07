import { UserResponse } from './user';

export interface SupportTicketResponse {
  id: string;
  title: string;
  description: string;
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'ACCOUNT' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolvedAt?: string;
  createdBy: UserResponse;
  assignedTo?: UserResponse;
  createdAt: string;
}

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'ACCOUNT' | 'GENERAL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

