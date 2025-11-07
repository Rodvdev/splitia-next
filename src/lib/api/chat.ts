import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  MessageResponse,
  SendMessageRequest,
  UpdateMessageRequest,
  ConversationResponse,
  CreateConversationRequest,
  UpdateConversationRequest,
} from '@/types';

export const chatApi = {
  // Messages
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

  updateMessage: async (
    conversationId: string,
    messageId: string,
    data: UpdateMessageRequest
  ): Promise<ApiResponse<MessageResponse>> => {
    const response = await apiClient.instance.put(
      `/conversations/${conversationId}/messages/${messageId}`,
      data
    );
    return response.data;
  },

  deleteMessage: async (conversationId: string, messageId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(
      `/conversations/${conversationId}/messages/${messageId}`
    );
    return response.data;
  },

  // Conversations
  getConversations: async (pageable?: Pageable): Promise<ApiResponse<Page<ConversationResponse>>> => {
    const response = await apiClient.instance.get('/conversations', { params: pageable });
    return response.data;
  },

  getConversationById: async (id: string): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.instance.get(`/conversations/${id}`);
    return response.data;
  },

  createConversation: async (
    data: CreateConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.instance.post('/conversations', data);
    return response.data;
  },

  updateConversation: async (
    id: string,
    data: UpdateConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.instance.put(`/conversations/${id}`, data);
    return response.data;
  },

  deleteConversation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/conversations/${id}`);
    return response.data;
  },
};

