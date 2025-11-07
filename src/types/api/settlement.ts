import { UserResponse } from './user';

export interface SettlementResponse {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: 'PAYMENT' | 'RECEIPT';
  initiatedBy: UserResponse;
  settledWithUser: UserResponse;
  createdAt: string;
}

export interface CreateSettlementRequest {
  amount: number;
  currency: string;
  description?: string;
  userId: string;
  type: 'PAYMENT' | 'RECEIPT';
}

