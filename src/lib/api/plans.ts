import { apiClient } from './client';
import { ApiResponse, Page, Pageable, PlanResponse } from '@/types';

export const plansApi = {
  getAll: async (pageable?: Pageable): Promise<ApiResponse<Page<PlanResponse>>> => {
    const response = await apiClient.instance.get('/plans', { params: pageable });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<PlanResponse>> => {
    const response = await apiClient.instance.get(`/plans/${id}`);
    return response.data;
  },
};

