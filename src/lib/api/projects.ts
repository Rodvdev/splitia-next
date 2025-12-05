import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  TimeEntryResponse,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  ProjectStatus,
} from '@/types';

export const projectsApi = {
  // Projects
  getAllProjects: async (
    pageable?: Pageable & {
      status?: ProjectStatus;
      managerId?: string;
    }
  ): Promise<ApiResponse<Page<ProjectResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/projects',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/projects', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/projects',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getProjectById: async (id: string): Promise<ApiResponse<ProjectResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/projects/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/projects/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/projects/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<ApiResponse<ProjectResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/projects',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/projects', data);
    apiLogger.general({
      endpoint: 'POST /admin/projects',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateProject: async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<ApiResponse<ProjectResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/projects/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/projects/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/projects/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateProjectStatus: async (
    id: string,
    status: ProjectStatus
  ): Promise<ApiResponse<ProjectResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/projects/${id}/status`,
      success: true,
      params: { status },
    });
    const response = await apiClient.instance.put(`/admin/projects/${id}/status`, null, {
      params: { status },
    });
    apiLogger.general({
      endpoint: `PUT /admin/projects/${id}/status`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteProject: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/projects/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/projects/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/projects/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Time Entries
  getTimeEntriesByProject: async (
    projectId: string,
    pageable?: Pageable
  ): Promise<ApiResponse<Page<TimeEntryResponse>>> => {
    apiLogger.general({
      endpoint: `GET /admin/projects/${projectId}/time-entries`,
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get(`/admin/projects/${projectId}/time-entries`, {
      params: pageable,
    });
    apiLogger.general({
      endpoint: `GET /admin/projects/${projectId}/time-entries`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getAllTimeEntries: async (
    pageable?: Pageable & {
      projectId?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<Page<TimeEntryResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/projects/time-entries',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/projects/time-entries', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/projects/time-entries',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getTimeEntryById: async (id: string): Promise<ApiResponse<TimeEntryResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/projects/time-entries/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/projects/time-entries/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/projects/time-entries/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createTimeEntry: async (data: CreateTimeEntryRequest): Promise<ApiResponse<TimeEntryResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/projects/time-entries',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/projects/time-entries', data);
    apiLogger.general({
      endpoint: 'POST /admin/projects/time-entries',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateTimeEntry: async (
    id: string,
    data: UpdateTimeEntryRequest
  ): Promise<ApiResponse<TimeEntryResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/projects/time-entries/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/projects/time-entries/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/projects/time-entries/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteTimeEntry: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/projects/time-entries/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/projects/time-entries/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/projects/time-entries/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },
};

