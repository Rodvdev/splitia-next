export interface SubscriptionResponse {
  id: string;
  planType: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  pricePerMonth: number;
  currency: string;
  createdAt: string;
}

export interface CreateSubscriptionRequest {
  planType: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  paymentMethod: string;
}

export interface UpdateSubscriptionRequest {
  planType?: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  autoRenew?: boolean;
}

