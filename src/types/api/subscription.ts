import { UserResponse } from './user';

export interface SubscriptionResponse {
  id: string;
  planType: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  pricePerMonth: number;
  currency: string;
  createdAt: string;
  user?: UserResponse;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export interface CreateSubscriptionRequest {
  planType: 'FREE' | 'PRO' | 'ENTERPRISE';
  paymentMethod: string;
}

export interface UpdateSubscriptionRequest {
  planType?: 'FREE' | 'PRO' | 'ENTERPRISE';
  status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  autoRenew?: boolean;
}

