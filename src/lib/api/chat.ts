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
    // Convertir sort array a string si es necesario (Spring Boot espera string)
    const params: { page?: number; size?: number; sort?: string } = {
      page: pageable?.page,
      size: pageable?.size,
    };
    if (pageable?.sort && Array.isArray(pageable.sort)) {
      params.sort = pageable.sort.join(',');
    } else if (!pageable?.sort) {
      params.sort = 'createdAt,desc';
    }
    const response = await apiClient.instance.get(`/conversations/${conversationId}/messages`, {
      params,
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
    messageId: string,
    data: UpdateMessageRequest
  ): Promise<ApiResponse<MessageResponse>> => {
    const response = await apiClient.instance.put(
      `/conversations/messages/${messageId}`,
      data
    );
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(
      `/conversations/messages/${messageId}`
    );
    return response.data;
  },

  // Conversations
  getConversations: async (pageable?: Pageable): Promise<ApiResponse<Page<ConversationResponse>>> => {
    // Convertir sort array a string si es necesario (Spring Boot espera string)
    const params: { page?: number; size?: number; sort?: string } = {
      page: pageable?.page,
      size: pageable?.size,
    };
    if (pageable?.sort && Array.isArray(pageable.sort)) {
      params.sort = pageable.sort.join(',');
    } else if (!pageable?.sort) {
      params.sort = 'createdAt,desc';
    }
    const response = await apiClient.instance.get('/conversations', { params });
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
   * 
   * Estrategia:
   * 1. Si el grupo tiene conversationId, obtener la conversación directamente
   * 2. Si no, buscar en la lista de conversaciones por groupId
   * 3. Si no existe, crear una nueva conversación
   */
  getOrCreateGroupConversation: async (groupId: string): Promise<ApiResponse<ConversationResponse>> => {
    try {
      // 1. Obtener el grupo
      const groupResponse = await groupsApi.getById(groupId);
      if (!groupResponse.success || !groupResponse.data) {
        throw new Error('Group not found');
      }
      const group = groupResponse.data;

      // 2. Opción 1: Si el grupo tiene conversationId, intentar obtener la conversación directamente
      if (group.conversationId) {
        try {
          const conversationResponse = await chatApi.getConversationById(group.conversationId);
          if (conversationResponse.success && conversationResponse.data) {
            return conversationResponse;
          }
        } catch (err) {
          // Si la conversación no existe (404) o falla, continuar con la búsqueda/creación
        }
      }

      // 3. Opción 2: Buscar conversación por groupId en la lista de conversaciones
      const conversationsResponse = await chatApi.getConversations({ page: 0, size: 100 });
      if (conversationsResponse.success && conversationsResponse.data) {
        const conversations = Array.isArray(conversationsResponse.data.content)
          ? conversationsResponse.data.content
          : [];

        // Buscar conversación que tenga el groupId coincidente
        const existingConversation = conversations.find(
          (conv) => conv.groupId === groupId
        );

        if (existingConversation) {
          return {
            success: true,
            data: existingConversation,
            message: 'Conversation found by groupId',
            timestamp: new Date().toISOString(),
          };
        }

        // Opción 3: Fallback - buscar por coincidencia de miembros (método antiguo)
        const conversationByMembers = conversations.find((conv) =>
          conversationMatchesGroup(conv, group)
        );

        if (conversationByMembers) {
          return {
            success: true,
            data: conversationByMembers,
            message: 'Conversation found by members',
            timestamp: new Date().toISOString(),
          };
        }
      }

      // 4. Si no existe, crear nueva conversación
      const userIds = getGroupMemberUserIds(group);
      const createResponse = await chatApi.createConversation({
        name: group.name,
        participantIds: userIds,
      });

      return createResponse;
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'message' in error)
        ? String((error as { message?: string }).message)
        : 'Failed to get or create group conversation';
      return {
        success: false,
        data: null as unknown as ConversationResponse,
        message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

