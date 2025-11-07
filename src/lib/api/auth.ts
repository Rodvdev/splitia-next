import { apiClient } from './client';
import { RegisterRequest, LoginRequest, AuthResponse, ApiResponse, UserResponse } from '@/types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.instance.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.instance.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.instance.post('/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await apiClient.instance.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  me: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.get('/auth/me');
    return response.data;
  },
};

