import { apiClient } from './client';
import { ApiResponse, Page, SupportTicketResponse, CreateSupportTicketRequest } from '@/types';

export const supportApi = {
  getAll: async (): Promise<ApiResponse<Page<SupportTicketResponse>>> => {
    const response = await apiClient.instance.get('/support/tickets');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<SupportTicketResponse>> => {
    const response = await apiClient.instance.get(`/support/tickets/${id}`);
    return response.data;
  },

  create: async (data: CreateSupportTicketRequest): Promise<ApiResponse<SupportTicketResponse>> => {
    const response = await apiClient.instance.post('/support/tickets', data);
    return response.data;
  },
};

