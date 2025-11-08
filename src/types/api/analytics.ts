// Analytics Types

export interface CustomerLTVResponse {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  ltv: number;
  projectedLtv: number;
  cohort: string;
}

export interface ChurnAnalysisResponse {
  period: string;
  totalCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  revenueLost: number;
  reasons: { reason: string; count: number }[];
}

export interface EngagementScoreResponse {
  customerId: string;
  customerName: string;
  score: number;
  metrics: {
    logins: number;
    actions: number;
    purchases: number;
    supportTickets: number;
  };
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface CohortAnalysisResponse {
  cohort: string;
  period: string;
  customers: number;
  retentionRate: number;
  revenue: number;
}

export interface CustomerSegmentationResponse {
  segment: string;
  customerCount: number;
  averageLTV: number;
  averageEngagement: number;
  characteristics: string[];
}

