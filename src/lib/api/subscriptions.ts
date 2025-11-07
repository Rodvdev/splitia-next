import { apiClient } from './client';
import { ApiResponse, SubscriptionResponse } from '@/types';

export const subscriptionsApi = {
  getCurrent: async (): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.get('/subscriptions/current');
    return response.data;
  },
};

