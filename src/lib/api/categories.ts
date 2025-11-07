import { apiClient } from './client';
import { ApiResponse, Page, Pageable, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

export const categoriesApi = {
  getAll: async (pageable?: Pageable): Promise<ApiResponse<Page<CategoryResponse>>> => {
    const response = await apiClient.instance.get('/categories', { params: pageable });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.instance.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.instance.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.instance.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/categories/${id}`);
    return response.data;
  },
};

