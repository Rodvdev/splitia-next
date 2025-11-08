import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  AuditLogResponse,
  AuditLogFilters,
  DataExportRequest,
  DataExportResponse,
  DataDeletionRequest,
  ConsentResponse,
} from '@/types';

export const auditApi = {
  // Audit Logs
  getAllAuditLogs: async (
    pageable?: Pageable & AuditLogFilters
  ): Promise<ApiResponse<Page<AuditLogResponse>>> => {
    const response = await apiClient.instance.get('/admin/audit/logs', {
      params: pageable,
    });
    return response.data;
  },

  getAuditLogById: async (id: string): Promise<ApiResponse<AuditLogResponse>> => {
    const response = await apiClient.instance.get(`/admin/audit/logs/${id}`);
    return response.data;
  },

  getAuditLogsByEntity: async (
    entityType: string,
    entityId: string,
    pageable?: Pageable
  ): Promise<ApiResponse<Page<AuditLogResponse>>> => {
    const response = await apiClient.instance.get(
      `/admin/audit/logs/entity/${entityType}/${entityId}`,
      { params: pageable }
    );
    return response.data;
  },

  // Compliance - Data Export
  requestDataExport: async (
    data: DataExportRequest
  ): Promise<ApiResponse<DataExportResponse>> => {
    const response = await apiClient.instance.post('/admin/audit/compliance/export', data);
    return response.data;
  },

  getDataExportStatus: async (id: string): Promise<ApiResponse<DataExportResponse>> => {
    const response = await apiClient.instance.get(`/admin/audit/compliance/export/${id}`);
    return response.data;
  },

  // Compliance - Data Deletion (GDPR Right to be Forgotten)
  requestDataDeletion: async (
    data: DataDeletionRequest
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.instance.post('/admin/audit/compliance/delete', data);
    return response.data;
  },

  // Compliance - Consent Management
  getAllConsents: async (
    pageable?: Pageable & { userId?: string; type?: string }
  ): Promise<ApiResponse<Page<ConsentResponse>>> => {
    const response = await apiClient.instance.get('/admin/audit/compliance/consents', {
      params: pageable,
    });
    return response.data;
  },

  updateConsent: async (
    userId: string,
    type: string,
    granted: boolean
  ): Promise<ApiResponse<ConsentResponse>> => {
    const response = await apiClient.instance.put(
      `/admin/audit/compliance/consents/${userId}/${type}`,
      { granted }
    );
    return response.data;
  },
};

