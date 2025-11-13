import { CategoryResponse } from './category';
import { GroupResponse } from './group';

export interface BudgetResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  currency: string;
  category?: CategoryResponse;
  group?: GroupResponse;
  groupId?: string;
  createdAt: string;
}

export interface CreateBudgetRequest {
  amount: number;
  month: number;
  year: number;
  currency?: string;
  categoryId?: string;
  groupId?: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  currency?: string;
}

