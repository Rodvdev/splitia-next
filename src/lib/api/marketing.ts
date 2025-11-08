import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  CampaignResponse,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  WorkflowResponse,
  CreateWorkflowRequest,
  LandingPageResponse,
  CreateLandingPageRequest,
} from '@/types';
import { apiLogger } from '@/lib/utils/api-logger';

export const marketingApi = {
  // Campaigns
  getAllCampaigns: async (pageable?: Pageable): Promise<ApiResponse<Page<CampaignResponse>>> => {
    const response = await apiClient.instance.get('/admin/marketing/campaigns', { params: pageable });
    apiLogger.general({ endpoint: 'getAllCampaigns', success: response.data.success, params: pageable, data: response.data });
    return response.data;
  },

  getCampaignById: async (id: string): Promise<ApiResponse<CampaignResponse>> => {
    const response = await apiClient.instance.get(`/admin/marketing/campaigns/${id}`);
    apiLogger.general({ endpoint: 'getCampaignById', success: response.data.success, params: { id }, data: response.data });
    return response.data;
  },

  createCampaign: async (data: CreateCampaignRequest): Promise<ApiResponse<CampaignResponse>> => {
    const response = await apiClient.instance.post('/admin/marketing/campaigns', data);
    apiLogger.general({ endpoint: 'createCampaign', success: response.data.success, params: { data }, data: response.data });
    return response.data;
  },

  updateCampaign: async (id: string, data: UpdateCampaignRequest): Promise<ApiResponse<CampaignResponse>> => {
    const response = await apiClient.instance.put(`/admin/marketing/campaigns/${id}`, data);
    apiLogger.general({ endpoint: 'updateCampaign', success: response.data.success, params: { id, data }, data: response.data });
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/marketing/campaigns/${id}`);
    apiLogger.general({ endpoint: 'deleteCampaign', success: response.data.success, params: { id } });
    return response.data;
  },

  // Workflows
  getAllWorkflows: async (pageable?: Pageable): Promise<ApiResponse<Page<WorkflowResponse>>> => {
    const response = await apiClient.instance.get('/admin/marketing/workflows', { params: pageable });
    apiLogger.general({ endpoint: 'getAllWorkflows', success: response.data.success, params: pageable, data: response.data });
    return response.data;
  },

  getWorkflowById: async (id: string): Promise<ApiResponse<WorkflowResponse>> => {
    const response = await apiClient.instance.get(`/admin/marketing/workflows/${id}`);
    apiLogger.general({ endpoint: 'getWorkflowById', success: response.data.success, params: { id }, data: response.data });
    return response.data;
  },

  createWorkflow: async (data: CreateWorkflowRequest): Promise<ApiResponse<WorkflowResponse>> => {
    const response = await apiClient.instance.post('/admin/marketing/workflows', data);
    apiLogger.general({ endpoint: 'createWorkflow', success: response.data.success, params: { data }, data: response.data });
    return response.data;
  },

  updateWorkflow: async (id: string, data: Partial<CreateWorkflowRequest>): Promise<ApiResponse<WorkflowResponse>> => {
    const response = await apiClient.instance.put(`/admin/marketing/workflows/${id}`, data);
    apiLogger.general({ endpoint: 'updateWorkflow', success: response.data.success, params: { id, data }, data: response.data });
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/marketing/workflows/${id}`);
    apiLogger.general({ endpoint: 'deleteWorkflow', success: response.data.success, params: { id } });
    return response.data;
  },

  // Landing Pages
  getAllLandingPages: async (pageable?: Pageable): Promise<ApiResponse<Page<LandingPageResponse>>> => {
    const response = await apiClient.instance.get('/admin/marketing/landing-pages', { params: pageable });
    apiLogger.general({ endpoint: 'getAllLandingPages', success: response.data.success, params: pageable, data: response.data });
    return response.data;
  },

  getLandingPageById: async (id: string): Promise<ApiResponse<LandingPageResponse>> => {
    const response = await apiClient.instance.get(`/admin/marketing/landing-pages/${id}`);
    apiLogger.general({ endpoint: 'getLandingPageById', success: response.data.success, params: { id }, data: response.data });
    return response.data;
  },

  createLandingPage: async (data: CreateLandingPageRequest): Promise<ApiResponse<LandingPageResponse>> => {
    const response = await apiClient.instance.post('/admin/marketing/landing-pages', data);
    apiLogger.general({ endpoint: 'createLandingPage', success: response.data.success, params: { data }, data: response.data });
    return response.data;
  },

  updateLandingPage: async (id: string, data: Partial<CreateLandingPageRequest>): Promise<ApiResponse<LandingPageResponse>> => {
    const response = await apiClient.instance.put(`/admin/marketing/landing-pages/${id}`, data);
    apiLogger.general({ endpoint: 'updateLandingPage', success: response.data.success, params: { id, data }, data: response.data });
    return response.data;
  },

  deleteLandingPage: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/marketing/landing-pages/${id}`);
    apiLogger.general({ endpoint: 'deleteLandingPage', success: response.data.success, params: { id } });
    return response.data;
  },
};

