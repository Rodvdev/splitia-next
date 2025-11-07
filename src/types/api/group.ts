import { UserResponse } from './user';

export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdBy: UserResponse;
  members: GroupMemberResponse[];
  createdAt: string;
}

export interface GroupMemberResponse {
  id: string;
  user: UserResponse;
  role: 'ADMIN' | 'MEMBER' | 'GUEST' | 'ASSISTANT';
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  image?: string;
}

export interface UpdateGroupMemberRequest {
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'ASSISTANT';
  permissions?: Record<string, boolean>;
}

export interface AssignPermissionsRequest {
  permissions: Record<string, boolean>;
}

