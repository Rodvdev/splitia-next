import { apiClient } from './client';
import { ApiResponse, Page, Pageable, MessageResponse, SendMessageRequest } from '@/types';

export const chatApi = {
  getMessages: async (
    conversationId: string,
    pageable?: Pageable
  ): Promise<ApiResponse<Page<MessageResponse>>> => {
    const response = await apiClient.instance.get(`/conversations/${conversationId}/messages`, {
      params: pageable,
    });
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<MessageResponse>> => {
    const response = await apiClient.instance.post(`/conversations/${data.conversationId}/messages`, {
      content: data.content,
    });
    return response.data;
  },
};

