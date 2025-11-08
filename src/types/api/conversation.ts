import { UserResponse } from './user';
import { MessageResponse } from './message';

export interface ConversationResponse {
  id: string;
  name?: string | null;
  isGroupChat: boolean;
  groupId?: string | null; // ID del grupo si es conversación de grupo, null si es chat individual/grupal manual
  participants: UserResponse[];
  lastMessage?: MessageResponse;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateConversationRequest {
  name?: string;
  participantIds: string[]; // REQUERIDO: Array de UUIDs de participantes (mínimo 1)
}

export interface UpdateConversationRequest {
  name?: string;
}

