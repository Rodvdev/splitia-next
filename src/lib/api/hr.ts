import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  EmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AttendanceResponse,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  PayrollResponse,
  CreatePayrollRequest,
  UpdatePayrollRequest,
  EmployeeStatus,
  AttendanceStatus,
  PayrollStatus,
} from '@/types';

export const hrApi = {
  // Employees
  getAllEmployees: async (pageable?: Pageable): Promise<ApiResponse<Page<EmployeeResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/hr/employees',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/hr/employees', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/hr/employees',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getEmployeeById: async (id: string): Promise<ApiResponse<EmployeeResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/hr/employees/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/hr/employees/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/hr/employees/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createEmployee: async (data: CreateEmployeeRequest): Promise<ApiResponse<EmployeeResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/hr/employees',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/hr/employees', data);
    apiLogger.general({
      endpoint: 'POST /admin/hr/employees',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateEmployee: async (
    id: string,
    data: UpdateEmployeeRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/hr/employees/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/hr/employees/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/hr/employees/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteEmployee: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/hr/employees/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/hr/employees/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/hr/employees/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Attendance
  getAllAttendance: async (
    pageable?: Pageable & {
      employeeId?: string;
    }
  ): Promise<ApiResponse<Page<AttendanceResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/hr/attendance',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/hr/attendance', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/hr/attendance',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getAttendanceById: async (id: string): Promise<ApiResponse<AttendanceResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/hr/attendance/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/hr/attendance/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/hr/attendance/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createAttendance: async (
    data: CreateAttendanceRequest
  ): Promise<ApiResponse<AttendanceResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/hr/attendance',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/hr/attendance', data);
    apiLogger.general({
      endpoint: 'POST /admin/hr/attendance',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateAttendance: async (
    id: string,
    data: UpdateAttendanceRequest
  ): Promise<ApiResponse<AttendanceResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/hr/attendance/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/hr/attendance/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/hr/attendance/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  checkIn: async (employeeId: string): Promise<ApiResponse<AttendanceResponse>> => {
    apiLogger.general({
      endpoint: `POST /admin/hr/attendance/${employeeId}/check-in`,
      success: true,
    });
    const response = await apiClient.instance.post(`/admin/hr/attendance/${employeeId}/check-in`);
    apiLogger.general({
      endpoint: `POST /admin/hr/attendance/${employeeId}/check-in`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  checkOut: async (employeeId: string): Promise<ApiResponse<AttendanceResponse>> => {
    apiLogger.general({
      endpoint: `POST /admin/hr/attendance/${employeeId}/check-out`,
      success: true,
    });
    const response = await apiClient.instance.post(`/admin/hr/attendance/${employeeId}/check-out`);
    apiLogger.general({
      endpoint: `POST /admin/hr/attendance/${employeeId}/check-out`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Payroll
  getAllPayroll: async (
    pageable?: Pageable & {
      employeeId?: string;
      status?: PayrollStatus;
    }
  ): Promise<ApiResponse<Page<PayrollResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/hr/payroll',
      success: true,
      params: pageable ? (pageable as unknown as Record<string, unknown>) : undefined,
    });
    const response = await apiClient.instance.get('/admin/hr/payroll', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/hr/payroll',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getPayrollById: async (id: string): Promise<ApiResponse<PayrollResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/hr/payroll/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/hr/payroll/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/hr/payroll/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createPayroll: async (data: CreatePayrollRequest): Promise<ApiResponse<PayrollResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/hr/payroll',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/hr/payroll', data);
    apiLogger.general({
      endpoint: 'POST /admin/hr/payroll',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updatePayroll: async (
    id: string,
    data: UpdatePayrollRequest
  ): Promise<ApiResponse<PayrollResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/hr/payroll/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/hr/payroll/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/hr/payroll/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  approvePayroll: async (id: string): Promise<ApiResponse<PayrollResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/hr/payroll/${id}/approve`,
      success: true,
    });
    const response = await apiClient.instance.put(`/admin/hr/payroll/${id}/approve`);
    apiLogger.general({
      endpoint: `PUT /admin/hr/payroll/${id}/approve`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deletePayroll: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/hr/payroll/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/hr/payroll/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/hr/payroll/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },
};

