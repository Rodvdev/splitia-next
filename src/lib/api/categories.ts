import { apiClient } from './client';
import { ApiResponse, Page, CategoryResponse } from '@/types';

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Page<CategoryResponse>>> => {
    const response = await apiClient.instance.get('/categories');
    return response.data;
  },
};

