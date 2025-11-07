import { UserResponse } from './user';
import { GroupResponse } from './group';

export interface GroupUserResponse {
  id: string;
  group: GroupResponse;
  user: UserResponse;
  role: 'ADMIN' | 'MEMBER' | 'GUEST' | 'ASSISTANT';
  joinedAt: string;
}

