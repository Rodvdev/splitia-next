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
import { groupsApi } from './groups';
import { getGroupMemberUserIds, conversationMatchesGroup } from '@/types/api/chat-group';

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

  /**
   * Obtiene o crea una conversación para un grupo
   * Si la conversación ya existe, la retorna. Si no, crea una nueva.
   */
  getOrCreateGroupConversation: async (groupId: string): Promise<ApiResponse<ConversationResponse>> => {
    try {
      // 1. Obtener el grupo
      const groupResponse = await groupsApi.getById(groupId);
      if (!groupResponse.success || !groupResponse.data) {
        throw new Error('Group not found');
      }
      const group = groupResponse.data;

      // 2. Obtener userIds de los miembros
      const userIds = getGroupMemberUserIds(group);

      // 3. Buscar conversaciones existentes del usuario
      const conversationsResponse = await chatApi.getConversations({ page: 0, size: 100 });
      if (conversationsResponse.success && conversationsResponse.data) {
        const conversations = Array.isArray(conversationsResponse.data.content)
          ? conversationsResponse.data.content
          : [];

        // Buscar conversación que coincida con los miembros del grupo
        const existingConversation = conversations.find((conv) =>
          conversationMatchesGroup(conv, group)
        );

        if (existingConversation) {
          return {
            success: true,
            data: existingConversation,
            message: 'Conversation found',
            timestamp: new Date().toISOString(),
          };
        }
      }

      // 4. Si no existe, crear nueva conversación
      const createResponse = await chatApi.createConversation({
        name: group.name,
        userIds: userIds,
      });

      return createResponse;
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Failed to get or create group conversation',
        timestamp: new Date().toISOString(),
      };
    }
  },
};

