import { UserResponse } from './user';
import { GroupResponse } from './group';

export interface GroupInvitationResponse {
  id: string;
  group: GroupResponse;
  invitedBy: UserResponse;
  invitedUser?: UserResponse;
  email?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface CreateGroupInvitationRequest {
  groupId: string;
  email?: string;
  userId?: string;
}

export interface UpdateGroupInvitationRequest {
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

