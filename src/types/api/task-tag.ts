import { GroupResponse } from './group';

export interface TaskTagResponse {
  id: string;
  name: string;
  color: string;
  group: GroupResponse;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskTagRequest {
  name: string;
  color: string;
  groupId: string;
}

export interface UpdateTaskTagRequest {
  name?: string;
  color?: string;
}

