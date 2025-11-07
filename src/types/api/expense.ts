import { UserResponse } from './user';
import { GroupResponse } from './group';
import { CategoryResponse } from './category';

export interface ExpenseResponse {
  id: string;
  amount: number;
  description: string;
  date: string;
  currency: string;
  location?: string;
  notes?: string;
  isSettlement: boolean;
  paidBy: UserResponse;
  group?: GroupResponse;
  category?: CategoryResponse;
  shares: ExpenseShareResponse[];
  createdAt: string;
}

export interface ExpenseShareResponse {
  id: string;
  amount: number;
  type: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
  user: UserResponse;
}

export interface ExpenseShareRequest {
  userId: string;
  amount: number;
  type: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  date: string;
  currency?: string;
  location?: string;
  notes?: string;
  groupId?: string;
  categoryId?: string;
  paidById: string;
  shares: ExpenseShareRequest[];
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  date?: string;
  currency?: string;
  location?: string;
  notes?: string;
  categoryId?: string;
  shares?: ExpenseShareRequest[];
}

