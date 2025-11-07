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

