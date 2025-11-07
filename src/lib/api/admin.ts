import { apiClient } from './client';
import { ApiResponse, Page, Pageable, UserResponse } from '@/types';

export const adminApi = {
  getAllUsers: async (pageable?: Pageable): Promise<ApiResponse<Page<UserResponse>>> => {
    const response = await apiClient.instance.get('/admin/users', { params: pageable });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.get(`/admin/users/${id}`);
    return response.data;
  },
};

