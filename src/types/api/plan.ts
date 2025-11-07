export interface PlanResponse {
  id: string;
  name: string;
  pricePerMonth: number;
  currency: string;
  maxGroups: number | null; // null means unlimited
  maxGroupMembers: number | null;
  maxAiRequestsPerMonth: number | null;
  maxExpensesPerGroup: number | null;
  maxBudgetsPerGroup: number | null;
  hasKanban: boolean;
  hasAdvancedAnalytics: boolean;
  hasCustomCategories: boolean;
  hasExportData: boolean;
  hasPrioritySupport: boolean;
  createdAt: string;
}

