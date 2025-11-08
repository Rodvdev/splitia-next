import { UserResponse } from './user';

export interface MessageResponse {
  id: string;
  content: string;
  isAI: boolean;
  sender: UserResponse;
  conversationId?: string; // ID de la conversación a la que pertenece el mensaje
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}

