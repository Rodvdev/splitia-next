import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '@/types';

export const contactsApi = {
  // Contacts
  getAllContacts: async (
    pageable?: Pageable & {
      companyId?: string;
    }
  ): Promise<ApiResponse<Page<ContactResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/contacts',
      success: true,
      params: pageable,
    });
    const response = await apiClient.instance.get('/admin/contacts', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/contacts',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getContactById: async (id: string): Promise<ApiResponse<ContactResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/contacts/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/contacts/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/contacts/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createContact: async (data: CreateContactRequest): Promise<ApiResponse<ContactResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/contacts',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/contacts', data);
    apiLogger.general({
      endpoint: 'POST /admin/contacts',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateContact: async (
    id: string,
    data: UpdateContactRequest
  ): Promise<ApiResponse<ContactResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/contacts/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/contacts/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/contacts/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteContact: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/contacts/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/contacts/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/contacts/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Companies
  getAllCompanies: async (
    pageable?: Pageable,
    search?: string
  ): Promise<ApiResponse<Page<CompanyResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/contacts/companies',
      success: true,
      params: { ...pageable, search },
    });
    const params: any = { ...pageable };
    if (search) {
      params.search = search;
    }
    const response = await apiClient.instance.get('/admin/contacts/companies', {
      params,
    });
    apiLogger.general({
      endpoint: 'GET /admin/contacts/companies',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getCompanyById: async (id: string): Promise<ApiResponse<CompanyResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/contacts/companies/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/contacts/companies/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/contacts/companies/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createCompany: async (data: CreateCompanyRequest): Promise<ApiResponse<CompanyResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/contacts/companies',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/contacts/companies', data);
    apiLogger.general({
      endpoint: 'POST /admin/contacts/companies',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateCompany: async (
    id: string,
    data: UpdateCompanyRequest
  ): Promise<ApiResponse<CompanyResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/contacts/companies/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/contacts/companies/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/contacts/companies/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteCompany: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/contacts/companies/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/contacts/companies/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/contacts/companies/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },
};
