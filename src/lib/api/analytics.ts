import { apiClient } from './client';
import {
  ApiResponse,
  CustomerLTVResponse,
  ChurnAnalysisResponse,
  EngagementScoreResponse,
  CohortAnalysisResponse,
  CustomerSegmentationResponse,
} from '@/types';
import { apiLogger } from '@/lib/utils/api-logger';

export const analyticsApi = {
  getCustomerLTV: async (params?: { customerId?: string; period?: string }): Promise<ApiResponse<CustomerLTVResponse[]>> => {
    const response = await apiClient.instance.get('/admin/analytics/customers/ltv', { params });
    apiLogger.general({ endpoint: 'getCustomerLTV', success: response.data.success, params, data: response.data });
    return response.data;
  },

  getChurnAnalysis: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<ChurnAnalysisResponse[]>> => {
    const response = await apiClient.instance.get('/admin/analytics/churn', { params });
    apiLogger.general({ endpoint: 'getChurnAnalysis', success: response.data.success, params, data: response.data });
    return response.data;
  },

  getEngagementScores: async (params?: { minScore?: number; maxScore?: number }): Promise<ApiResponse<EngagementScoreResponse[]>> => {
    const response = await apiClient.instance.get('/admin/analytics/engagement', { params });
    apiLogger.general({ endpoint: 'getEngagementScores', success: response.data.success, params, data: response.data });
    return response.data;
  },

  getCohortAnalysis: async (params?: { cohort?: string }): Promise<ApiResponse<CohortAnalysisResponse[]>> => {
    const response = await apiClient.instance.get('/admin/analytics/cohorts', { params });
    apiLogger.general({ endpoint: 'getCohortAnalysis', success: response.data.success, params, data: response.data });
    return response.data;
  },

  getCustomerSegmentation: async (): Promise<ApiResponse<CustomerSegmentationResponse[]>> => {
    const response = await apiClient.instance.get('/admin/analytics/segmentation');
    apiLogger.general({ endpoint: 'getCustomerSegmentation', success: response.data.success, data: response.data });
    return response.data;
  },
};

