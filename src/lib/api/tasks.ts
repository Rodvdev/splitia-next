import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from '@/types';

export const tasksApi = {
  getTasksByGroup: async (
    groupId: string,
    pageable?: Pageable
  ): Promise<ApiResponse<Page<TaskResponse>>> => {
    const response = await apiClient.instance.get(`/tasks/group/${groupId}`, { params: pageable });
    return response.data;
  },

  getTasksByGroupAndStatus: async (
    groupId: string,
    status: TaskStatus,
    pageable?: Pageable
  ): Promise<ApiResponse<Page<TaskResponse>>> => {
    const response = await apiClient.instance.get(`/tasks/group/${groupId}/status/${status}`, {
      params: pageable,
    });
    return response.data;
  },

  getTaskById: async (id: string): Promise<ApiResponse<TaskResponse>> => {
    const response = await apiClient.instance.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<ApiResponse<TaskResponse>> => {
    const response = await apiClient.instance.post('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<ApiResponse<TaskResponse>> => {
    const response = await apiClient.instance.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/tasks/${id}`);
    return response.data;
  },
};

