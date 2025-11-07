import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  GroupResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  UpdateGroupMemberRequest,
  AssignPermissionsRequest,
} from '@/types';

export const groupsApi = {
  getAll: async (pageable?: Pageable): Promise<ApiResponse<Page<GroupResponse>>> => {
    const response = await apiClient.instance.get('/groups', { params: pageable });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<GroupResponse>> => {
    const response = await apiClient.instance.get(`/groups/${id}`);
    return response.data;
  },

  create: async (data: CreateGroupRequest): Promise<ApiResponse<GroupResponse>> => {
    const response = await apiClient.instance.post('/groups', data);
    return response.data;
  },

  update: async (id: string, data: UpdateGroupRequest): Promise<ApiResponse<GroupResponse>> => {
    const response = await apiClient.instance.put(`/groups/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/groups/${id}`);
    return response.data;
  },

  addMember: async (groupId: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.post(`/groups/${groupId}/members`, null, {
      params: { userId },
    });
    return response.data;
  },

  removeMember: async (groupId: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  updateMember: async (
    groupId: string,
    userId: string,
    data: UpdateGroupMemberRequest
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.put(`/groups/${groupId}/members/${userId}`, data);
    return response.data;
  },

  assignPermissions: async (
    groupId: string,
    userId: string,
    data: AssignPermissionsRequest
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.post(
      `/groups/${groupId}/members/${userId}/permissions`,
      data
    );
    return response.data;
  },
};

