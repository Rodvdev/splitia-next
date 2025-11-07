import { apiClient } from './client';
import { ApiResponse, UserResponse, UpdateProfileRequest, ChangePasswordRequest, UpdatePreferencesRequest } from '@/types';

export const usersApi = {
  getMe: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.get('/users/me');
    return response.data;
  },

  updateMe: async (data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.put('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.put('/users/me/password', data);
    return response.data;
  },

  updatePreferences: async (data: UpdatePreferencesRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.put('/users/me/preferences', data);
    return response.data;
  },
};

