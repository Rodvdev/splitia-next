import { apiClient } from './client';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  ApiResponse,
  Page,
  Pageable,
  InvoiceResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  PaymentResponse,
  CreatePaymentRequest,
  BalanceSheetResponse,
  IncomeStatementResponse,
  CashFlowResponse,
  ProfitabilityResponse,
  InvoiceStatus,
} from '@/types';

export const financeApi = {
  // Invoices
  getAllInvoices: async (
    pageable?: Pageable & {
      status?: InvoiceStatus;
      contactId?: string;
      companyId?: string;
    }
  ): Promise<ApiResponse<Page<InvoiceResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/finance/invoices',
      success: true,
      params: pageable,
    });
    const response = await apiClient.instance.get('/admin/finance/invoices', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/finance/invoices',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<ApiResponse<InvoiceResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/finance/invoices/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/finance/invoices/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/finance/invoices/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceRequest): Promise<ApiResponse<InvoiceResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/finance/invoices',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/finance/invoices', data);
    apiLogger.general({
      endpoint: 'POST /admin/finance/invoices',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  updateInvoice: async (
    id: string,
    data: UpdateInvoiceRequest
  ): Promise<ApiResponse<InvoiceResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/finance/invoices/${id}`,
      success: true,
      data,
    });
    const response = await apiClient.instance.put(`/admin/finance/invoices/${id}`, data);
    apiLogger.general({
      endpoint: `PUT /admin/finance/invoices/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  addPaymentToInvoice: async (
    id: string,
    data: CreatePaymentRequest
  ): Promise<ApiResponse<PaymentResponse>> => {
    apiLogger.general({
      endpoint: `POST /admin/finance/invoices/${id}/payments`,
      success: true,
      data,
    });
    const response = await apiClient.instance.post(`/admin/finance/invoices/${id}/payments`, data);
    apiLogger.general({
      endpoint: `POST /admin/finance/invoices/${id}/payments`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deleteInvoice: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/finance/invoices/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/finance/invoices/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/finance/invoices/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Payments
  getAllPayments: async (
    pageable?: Pageable & {
      invoiceId?: string;
    }
  ): Promise<ApiResponse<Page<PaymentResponse>>> => {
    apiLogger.general({
      endpoint: 'GET /admin/finance/payments',
      success: true,
      params: pageable,
    });
    const response = await apiClient.instance.get('/admin/finance/payments', {
      params: pageable,
    });
    apiLogger.general({
      endpoint: 'GET /admin/finance/payments',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getPaymentById: async (id: string): Promise<ApiResponse<PaymentResponse>> => {
    apiLogger.general({
      endpoint: `GET /admin/finance/payments/${id}`,
      success: true,
    });
    const response = await apiClient.instance.get(`/admin/finance/payments/${id}`);
    apiLogger.general({
      endpoint: `GET /admin/finance/payments/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  createPayment: async (data: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    apiLogger.general({
      endpoint: 'POST /admin/finance/payments',
      success: true,
      data,
    });
    const response = await apiClient.instance.post('/admin/finance/payments', data);
    apiLogger.general({
      endpoint: 'POST /admin/finance/payments',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  reconcilePayment: async (
    id: string,
    isReconciled: boolean = true
  ): Promise<ApiResponse<PaymentResponse>> => {
    apiLogger.general({
      endpoint: `PUT /admin/finance/payments/${id}/reconcile`,
      success: true,
      params: { isReconciled },
    });
    const response = await apiClient.instance.put(`/admin/finance/payments/${id}/reconcile`, null, {
      params: { isReconciled },
    });
    apiLogger.general({
      endpoint: `PUT /admin/finance/payments/${id}/reconcile`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  deletePayment: async (id: string, hard?: boolean): Promise<ApiResponse<void>> => {
    apiLogger.general({
      endpoint: `DELETE /admin/finance/payments/${id}`,
      success: true,
      params: { hard },
    });
    const response = await apiClient.instance.delete(`/admin/finance/payments/${id}`, {
      params: { hard },
    });
    apiLogger.general({
      endpoint: `DELETE /admin/finance/payments/${id}`,
      success: true,
      data: response.data,
    });
    return response.data;
  },

  // Financial Reports
  getBalanceSheet: async (asOfDate?: string): Promise<ApiResponse<BalanceSheetResponse>> => {
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/balance-sheet',
      success: true,
      params: { asOfDate },
    });
    const response = await apiClient.instance.get('/admin/finance/reports/balance-sheet', {
      params: { asOfDate },
    });
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/balance-sheet',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getIncomeStatement: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<IncomeStatementResponse>> => {
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/income-statement',
      success: true,
      params: { startDate, endDate },
    });
    const response = await apiClient.instance.get('/admin/finance/reports/income-statement', {
      params: { startDate, endDate },
    });
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/income-statement',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getCashFlow: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<CashFlowResponse>> => {
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/cash-flow',
      success: true,
      params: { startDate, endDate },
    });
    const response = await apiClient.instance.get('/admin/finance/reports/cash-flow', {
      params: { startDate, endDate },
    });
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/cash-flow',
      success: true,
      data: response.data,
    });
    return response.data;
  },

  getProfitability: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ProfitabilityResponse>> => {
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/profitability',
      success: true,
      params: { startDate, endDate },
    });
    const response = await apiClient.instance.get('/admin/finance/reports/profitability', {
      params: { startDate, endDate },
    });
    apiLogger.general({
      endpoint: 'GET /admin/finance/reports/profitability',
      success: true,
      data: response.data,
    });
    return response.data;
  },
};
