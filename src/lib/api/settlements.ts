import { apiClient } from './client';
import { ApiResponse, Page, Pageable, SettlementResponse, CreateSettlementRequest } from '@/types';

export const settlementsApi = {
  getAll: async (pageable?: Pageable): Promise<ApiResponse<Page<SettlementResponse>>> => {
    const response = await apiClient.instance.get('/settlements', { params: pageable });
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
  // Note: UPDATE and DELETE are only available for admins via adminApi
};

