import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '@/types';

export const expensesApi = {
  getAll: async (params?: { groupId?: string } & Pageable): Promise<ApiResponse<Page<ExpenseResponse>>> => {
    const response = await apiClient.instance.get('/expenses', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<ExpenseResponse>> => {
    const response = await apiClient.instance.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenseRequest): Promise<ApiResponse<ExpenseResponse>> => {
    const response = await apiClient.instance.post('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: UpdateExpenseRequest): Promise<ApiResponse<ExpenseResponse>> => {
    const response = await apiClient.instance.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/expenses/${id}`);
    return response.data;
  },
};

