import { UserResponse } from './user';

export interface MessageResponse {
  id: string;
  content: string;
  isAI: boolean;
  sender: UserResponse;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}

