import { CategoryResponse } from './category';

export interface BudgetResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  currency: string;
  category?: CategoryResponse;
  createdAt: string;
}

export interface CreateBudgetRequest {
  amount: number;
  month: number;
  year: number;
  currency?: string;
  categoryId?: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  currency?: string;
}

