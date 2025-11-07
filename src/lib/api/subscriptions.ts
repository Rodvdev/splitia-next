import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '@/types';

export const subscriptionsApi = {
  getAll: async (pageable?: Pageable): Promise<ApiResponse<Page<SubscriptionResponse>>> => {
    const response = await apiClient.instance.get('/subscriptions', { params: pageable });
    return response.data;
  },

  getCurrent: async (): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.get('/subscriptions/current');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.get(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (data: CreateSubscriptionRequest): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.post('/subscriptions', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateSubscriptionRequest
  ): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/subscriptions/${id}`);
    return response.data;
  },
};

