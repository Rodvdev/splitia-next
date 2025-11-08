import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  OpportunityResponse,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityStage,
  LeadResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  ActivityResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  PipelineResponse,
  ForecastingResponse,
  SalesMetricsResponse,
  LeadStatus,
  LeadSource,
} from '@/types';

export const salesApi = {
  // Opportunities
  getAllOpportunities: async (
    pageable?: Pageable & {
      stage?: OpportunityStage;
      assignedToId?: string;
    }
  ): Promise<ApiResponse<Page<OpportunityResponse>>> => {
    apiLogger.sales({
      endpoint: 'GET /admin/sales/opportunities',
      success: true,
      params: pageable,
    });
    const response = await apiClient.instance.get('/admin/sales/opportunities', {
      params: pageable,
    });
    apiLogger.sales({
      endpoint: 'GET /admin/sales/opportunities',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getOpportunityById: async (id: string): Promise<ApiResponse<OpportunityResponse>> => {
    apiLogger.sales({
      endpoint: `GET /admin/sales/opportunities/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/sales/opportunities/${id}`);
    apiLogger.sales({
      endpoint: `GET /admin/sales/opportunities/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createOpportunity: async (
    data: CreateOpportunityRequest
  ): Promise<ApiResponse<OpportunityResponse>> => {
    apiLogger.sales({
      endpoint: 'POST /admin/sales/opportunities',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/sales/opportunities', data);
    apiLogger.sales({
      endpoint: 'POST /admin/sales/opportunities',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateOpportunity: async (
    id: string,
    data: UpdateOpportunityRequest
  ): Promise<ApiResponse<OpportunityResponse>> => {
    apiLogger.sales({
      endpoint: `PUT /admin/sales/opportunities/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/sales/opportunities/${id}`, data);
    apiLogger.sales({
      endpoint: `PUT /admin/sales/opportunities/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateOpportunityStage: async (
    id: string,
    stage: OpportunityStage
  ): Promise<ApiResponse<OpportunityResponse>> => {
    apiLogger.sales({
      endpoint: `PUT /admin/sales/opportunities/${id}/stage`,
      success: true,
      params: { stage },
    });
    const response = await apiClient.instance.put(`/admin/sales/opportunities/${id}/stage`, null, {
      params: { stage },
    });
    apiLogger.sales({
      endpoint: `PUT /admin/sales/opportunities/${id}/stage`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteOpportunity: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.sales({
      endpoint: `DELETE /admin/sales/opportunities/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/sales/opportunities/${id}`, {
      params: { hard },
    });
    apiLogger.sales({
      endpoint: `DELETE /admin/sales/opportunities/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getPipeline: async (): Promise<ApiResponse<PipelineResponse>> => {
    apiLogger.sales({
      endpoint: 'GET /admin/sales/opportunities/pipeline',
      success: true,
    });
    const response = await apiClient.instance.get('/admin/sales/opportunities/pipeline');
    apiLogger.sales({
      endpoint: 'GET /admin/sales/opportunities/pipeline',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Leads
  getAllLeads: async (
    pageable?: Pageable & {
      status?: LeadStatus;
      assignedToId?: string;
    }
  ): Promise<ApiResponse<Page<LeadResponse>>> => {
    apiLogger.sales({
      endpoint: 'GET /admin/sales/leads',
      success: true,
      params: pageable,
    });
    const response = await apiClient.instance.get('/admin/sales/leads', {
      params: pageable,
    });
    apiLogger.sales({
      endpoint: 'GET /admin/sales/leads',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getLeadById: async (id: string): Promise<ApiResponse<LeadResponse>> => {
    apiLogger.sales({
      endpoint: `GET /admin/sales/leads/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/sales/leads/${id}`);
    apiLogger.sales({
      endpoint: `GET /admin/sales/leads/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createLead: async (data: CreateLeadRequest): Promise<ApiResponse<LeadResponse>> => {
    apiLogger.sales({
      endpoint: 'POST /admin/sales/leads',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/sales/leads', data);
    apiLogger.sales({
      endpoint: 'POST /admin/sales/leads',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateLead: async (
    id: string,
    data: UpdateLeadRequest
  ): Promise<ApiResponse<LeadResponse>> => {
    apiLogger.sales({
      endpoint: `PUT /admin/sales/leads/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/sales/leads/${id}`, data);
    apiLogger.sales({
      endpoint: `PUT /admin/sales/leads/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateLeadScore: async (id: string, score: number): Promise<ApiResponse<LeadResponse>> => {
    apiLogger.sales({
      endpoint: `PUT /admin/sales/leads/${id}/score`,
      success: true,
      params: { score },
    });
    const response = await apiClient.instance.put(`/admin/sales/leads/${id}/score`, null, {
      params: { score },
    });
    apiLogger.sales({
      endpoint: `PUT /admin/sales/leads/${id}/score`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  convertLead: async (id: string): Promise<ApiResponse<OpportunityResponse>> => {
    apiLogger.sales({
      endpoint: `POST /admin/sales/leads/${id}/convert`,
      success: true,
    });
    const response = await apiClient.instance.post(`/admin/sales/leads/${id}/convert`);
    apiLogger.sales({
      endpoint: `POST /admin/sales/leads/${id}/convert`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteLead: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.sales({
      endpoint: `DELETE /admin/sales/leads/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/sales/leads/${id}`, {
      params: { hard },
    });
    apiLogger.sales({
      endpoint: `DELETE /admin/sales/leads/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Activities
  getAllActivities: async (
    pageable?: Pageable
  ): Promise<ApiResponse<Page<ActivityResponse>>> => {
    apiLogger.sales({
      endpoint: 'GET /admin/sales/activities',
      success: true,
      params: pageable,
    });
    const response = await apiClient.instance.get('/admin/sales/activities', {
      params: pageable,
    });
    apiLogger.sales({
      endpoint: 'GET /admin/sales/activities',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getActivityById: async (id: string): Promise<ApiResponse<ActivityResponse>> => {
    apiLogger.sales({
      endpoint: `GET /admin/sales/activities/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/sales/activities/${id}`);
    apiLogger.sales({
      endpoint: `GET /admin/sales/activities/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getActivitiesByOpportunity: async (
    opportunityId: string
  ): Promise<ApiResponse<ActivityResponse[]>> => {
    apiLogger.sales({
      endpoint: `GET /admin/sales/activities/opportunity/${opportunityId}`,
      success: true,
    });
    const response = await apiClient.instance.get(
      `/admin/sales/activities/opportunity/${opportunityId}`
    );
    apiLogger.sales({
      endpoint: `GET /admin/sales/activities/opportunity/${opportunityId}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getActivitiesByLead: async (leadId: string): Promise<ApiResponse<ActivityResponse[]>> => {
    apiLogger.sales({
      endpoint: `GET /admin/sales/activities/lead/${leadId}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/sales/activities/lead/${leadId}`);
    apiLogger.sales({
      endpoint: `GET /admin/sales/activities/lead/${leadId}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createActivity: async (data: CreateActivityRequest): Promise<ApiResponse<ActivityResponse>> => {
    apiLogger.sales({
      endpoint: 'POST /admin/sales/activities',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/sales/activities', data);
    apiLogger.sales({
      endpoint: 'POST /admin/sales/activities',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateActivity: async (
    id: string,
    data: UpdateActivityRequest
  ): Promise<ApiResponse<ActivityResponse>> => {
    apiLogger.sales({
      endpoint: `PUT /admin/sales/activities/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/sales/activities/${id}`, data);
    apiLogger.sales({
      endpoint: `PUT /admin/sales/activities/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  completeActivity: async (id: string): Promise<ApiResponse<ActivityResponse>> => {
    apiLogger.sales({
      endpoint: `PUT /admin/sales/activities/${id}/complete`,
      success: true,
    });
    const response = await apiClient.instance.put(`/admin/sales/activities/${id}/complete`);
    apiLogger.sales({
      endpoint: `PUT /admin/sales/activities/${id}/complete`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteActivity: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.sales({
      endpoint: `DELETE /admin/sales/activities/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/sales/activities/${id}`, {
      params: { hard },
    });
    apiLogger.sales({
      endpoint: `DELETE /admin/sales/activities/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Forecasting and Metrics
  getForecasting: async (
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ForecastingResponse>> => {
    apiLogger.sales({
      endpoint: 'GET /admin/sales/forecasting',
      success: true,
      params: { period, startDate, endDate },
    });
    const response = await apiClient.instance.get('/admin/sales/forecasting', {
      params: { period, startDate, endDate },
    });
    apiLogger.sales({
      endpoint: 'GET /admin/sales/forecasting',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getMetrics: async (): Promise<ApiResponse<SalesMetricsResponse>> => {
    apiLogger.sales({
      endpoint: 'GET /admin/sales/metrics',
      success: true,
    });
    const response = await apiClient.instance.get('/admin/sales/metrics');
    apiLogger.sales({
      endpoint: 'GET /admin/sales/metrics',
      success: true,
      data: response.data,
    });
    return response.data;
  },
};
