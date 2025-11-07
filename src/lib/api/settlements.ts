import { apiClient } from './client';
import { ApiResponse, Page, SettlementResponse, CreateSettlementRequest } from '@/types';

export const settlementsApi = {
  getAll: async (): Promise<ApiResponse<Page<SettlementResponse>>> => {
    const response = await apiClient.instance.get('/settlements');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<SettlementResponse>> => {
    const response = await apiClient.instance.get(`/settlements/${id}`);
    return response.data;
  },

  create: async (data: CreateSettlementRequest): Promise<ApiResponse<SettlementResponse>> => {
    const response = await apiClient.instance.post('/settlements', data);
    return response.data;
  },
};

