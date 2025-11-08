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
  // New fields from targeted invitations feature
  token?: string;
  invitedUserId?: string;
  invitedUserName?: string;
}

export interface CreateGroupInvitationRequest {
  groupId: string;
  email?: string;
  userId?: string;
}

export interface UpdateGroupInvitationRequest {
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

// New targeted invitation request (groupId comes from path)
export interface CreateTargetedGroupInvitationRequest {
  email?: string;
  userId?: string;
  expiresAt?: string; // ISO string
  maxUses?: number;
}

