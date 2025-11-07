import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  TaskTagResponse,
  CreateTaskTagRequest,
  UpdateTaskTagRequest,
} from '@/types';

export const taskTagsApi = {
  getTagsByGroup: async (groupId: string): Promise<ApiResponse<TaskTagResponse[]>> => {
    const response = await apiClient.instance.get(`/task-tags/group/${groupId}`);
    return response.data;
  },

  getTagById: async (id: string): Promise<ApiResponse<TaskTagResponse>> => {
    const response = await apiClient.instance.get(`/task-tags/${id}`);
    return response.data;
  },

  createTag: async (data: CreateTaskTagRequest): Promise<ApiResponse<TaskTagResponse>> => {
    const response = await apiClient.instance.post('/task-tags', data);
    return response.data;
  },

  updateTag: async (
    id: string,
    data: UpdateTaskTagRequest
  ): Promise<ApiResponse<TaskTagResponse>> => {
    const response = await apiClient.instance.put(`/task-tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/task-tags/${id}`);
    return response.data;
  },
};

