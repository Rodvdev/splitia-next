import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  VendorResponse,
  CreateVendorRequest,
  UpdateVendorRequest,
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReceivePurchaseOrderRequest,
  PurchaseOrderStatus,
} from '@/types';

export const procurementApi = {
  // Vendors
  getAllVendors: async (pageable?: Pageable): Promise<ApiResponse<Page<VendorResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/procurement/vendors',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/procurement/vendors', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/procurement/vendors',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getVendorById: async (id: string): Promise<ApiResponse<VendorResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/procurement/vendors/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/procurement/vendors/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/procurement/vendors/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createVendor: async (data: CreateVendorRequest): Promise<ApiResponse<VendorResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/procurement/vendors',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/procurement/vendors', data);
    apiLogger.general({
      endpoint: 'POST /admin/procurement/vendors',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateVendor: async (
    id: string,
    data: UpdateVendorRequest
  ): Promise<ApiResponse<VendorResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/procurement/vendors/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/procurement/vendors/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/procurement/vendors/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteVendor: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/procurement/vendors/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/procurement/vendors/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/procurement/vendors/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Purchase Orders
  getAllPurchaseOrders: async (
    pageable?: Pageable & {
      status?: PurchaseOrderStatus;
      vendorId?: string;
    }
  ): Promise<ApiResponse<Page<PurchaseOrderResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/procurement/purchase-orders',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/procurement/purchase-orders', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/procurement/purchase-orders',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getPurchaseOrderById: async (id: string): Promise<ApiResponse<PurchaseOrderResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/procurement/purchase-orders/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/procurement/purchase-orders/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/procurement/purchase-orders/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createPurchaseOrder: async (
    data: CreatePurchaseOrderRequest
  ): Promise<ApiResponse<PurchaseOrderResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/procurement/purchase-orders',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/procurement/purchase-orders', data);
    apiLogger.general({
      endpoint: 'POST /admin/procurement/purchase-orders',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updatePurchaseOrder: async (
    id: string,
    data: UpdatePurchaseOrderRequest
  ): Promise<ApiResponse<PurchaseOrderResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/procurement/purchase-orders/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/procurement/purchase-orders/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/procurement/purchase-orders/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  receivePurchaseOrder: async (
    id: string,
    data: ReceivePurchaseOrderRequest
  ): Promise<ApiResponse<PurchaseOrderResponse>> => {
    apiLogger.general({
      endpoint: `POST /admin/procurement/purchase-orders/${id}/receive`,
      success: true,
      data,
    });
    const response = await apiClient.instance.post(
      `/admin/procurement/purchase-orders/${id}/receive`,
      data
    );
    apiLogger.general({
      endpoint: `POST /admin/procurement/purchase-orders/${id}/receive`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updatePurchaseOrderStatus: async (
    id: string,
    status: PurchaseOrderStatus
  ): Promise<ApiResponse<PurchaseOrderResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/procurement/purchase-orders/${id}/status`,
      success: true,
      params: { status },
    });
    const response = await apiClient.instance.put(
      `/admin/procurement/purchase-orders/${id}/status`,
      null,
      {
        params: { status },
      }
    );
    apiLogger.general({
      endpoint: `PUT /admin/procurement/purchase-orders/${id}/status`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deletePurchaseOrder: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/procurement/purchase-orders/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/procurement/purchase-orders/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/procurement/purchase-orders/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },
};

