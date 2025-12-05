import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  StockResponse,
  StockMovementResponse,
  CreateStockMovementRequest,
  ProductCategoryResponse,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
  ProductType,
} from '@/types';

export const inventoryApi = {
  // Products
  getAllProducts: async (
    pageable?: Pageable & {
      type?: ProductType;
      category?: string;
      search?: string;
    }
  ): Promise<ApiResponse<Page<ProductResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/inventory/products',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/inventory/products', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/inventory/products',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<ApiResponse<ProductResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/inventory/products/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/inventory/products/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/inventory/products/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getProductBySku: async (sku: string): Promise<ApiResponse<ProductResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/inventory/products/sku/${sku}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/inventory/products/sku/${sku}`);
    apiLogger.general({
      endpoint: `GET /admin/inventory/products/sku/${sku}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<ApiResponse<ProductResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/inventory/products',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/inventory/products', data);
    apiLogger.general({
      endpoint: 'POST /admin/inventory/products',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest
  ): Promise<ApiResponse<ProductResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/inventory/products/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/inventory/products/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/inventory/products/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteProduct: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/inventory/products/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/inventory/products/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/inventory/products/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Stock
  getStockByProductId: async (productId: string): Promise<ApiResponse<StockResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/inventory/stock/${productId}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/inventory/stock/${productId}`);
    apiLogger.general({
      endpoint: `GET /admin/inventory/stock/${productId}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getLowStock: async (): Promise<ApiResponse<StockResponse[]>> => {
    apiLogger.general({
      endpoint: 'GET /admin/inventory/stock/low-stock',
      success: true,
    });
    const response = await apiClient.instance.get('/admin/inventory/stock/low-stock');
    apiLogger.general({
      endpoint: 'GET /admin/inventory/stock/low-stock',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Stock Movements
  getAllStockMovements: async (
    pageable?: Pageable & {
      productId?: string;
    }
  ): Promise<ApiResponse<Page<StockMovementResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/inventory/movements',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/inventory/movements', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/inventory/movements',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createStockMovement: async (
    data: CreateStockMovementRequest
  ): Promise<ApiResponse<StockMovementResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/inventory/movements',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/inventory/movements', data);
    apiLogger.general({
      endpoint: 'POST /admin/inventory/movements',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteStockMovement: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/inventory/movements/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/inventory/movements/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/inventory/movements/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Product Categories
  getAllProductCategories: async (
    pageable?: Pageable & { search?: string }
  ): Promise<ApiResponse<Page<ProductCategoryResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/inventory/categories',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/inventory/categories', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/inventory/categories',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getProductCategoryById: async (id: string): Promise<ApiResponse<ProductCategoryResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/inventory/categories/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/inventory/categories/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/inventory/categories/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createProductCategory: async (
    data: CreateProductCategoryRequest
  ): Promise<ApiResponse<ProductCategoryResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/inventory/categories',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/inventory/categories', data);
    apiLogger.general({
      endpoint: 'POST /admin/inventory/categories',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateProductCategory: async (
    id: string,
    data: UpdateProductCategoryRequest
  ): Promise<ApiResponse<ProductCategoryResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/inventory/categories/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/inventory/categories/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/inventory/categories/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteProductCategory: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/inventory/categories/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/inventory/categories/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/inventory/categories/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },
};
