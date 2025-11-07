import { UserResponse } from './user';
import { MessageResponse } from './message';

export interface ConversationResponse {
  id: string;
  name?: string;
  type: 'INDIVIDUAL' | 'GROUP' | 'AI';
  members: UserResponse[];
  lastMessage?: MessageResponse;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  name?: string;
  userIds: string[]; // Para conversaciones individuales/grupales
}

export interface UpdateConversationRequest {
  name?: string;
}

