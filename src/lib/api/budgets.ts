import { apiClient } from './client';
import { ApiResponse, Page, Pageable, BudgetResponse, CreateBudgetRequest, UpdateBudgetRequest } from '@/types';

export const budgetsApi = {
  getAll: async (pageable?: Pageable): Promise<ApiResponse<Page<BudgetResponse>>> => {
    const response = await apiClient.instance.get('/budgets', { params: pageable });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<BudgetResponse>> => {
    const response = await apiClient.instance.get(`/budgets/${id}`);
    return response.data;
  },

  create: async (data: CreateBudgetRequest): Promise<ApiResponse<BudgetResponse>> => {
    const response = await apiClient.instance.post('/budgets', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBudgetRequest): Promise<ApiResponse<BudgetResponse>> => {
    const response = await apiClient.instance.put(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/budgets/${id}`);
    return response.data;
  },
};

