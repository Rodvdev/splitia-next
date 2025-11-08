// Finance Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'PAYPAL'
  | 'OTHER';

// Invoice Item Response según backend
export interface InvoiceItemResponse {
  id: string; // UUID
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Invoice Response según backend
export interface InvoiceResponse {
  id: string; // UUID
  invoiceNumber: string;
  issueDate: string; // ISO 8601 date
  dueDate: string; // ISO 8601 date
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  contactId?: string; // UUID
  contactName?: string;
  companyId?: string; // UUID
  companyName?: string;
  createdById?: string; // UUID
  createdByName?: string;
  items?: InvoiceItemResponse[];
  paidAmount: number;
  remainingAmount: number;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateInvoiceRequest {
  invoiceNumber?: string; // Opcional - se genera automáticamente si no se proporciona
  issueDate: string;
  dueDate: string;
  status?: InvoiceStatus; // Default: 'DRAFT'
  subtotal: number;
  tax: number;
  total: number;
  currency?: string; // Default: 'USD'
  notes?: string;
  contactId?: string;
  companyId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface UpdateInvoiceRequest {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  status?: InvoiceStatus;
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  notes?: string;
  contactId?: string;
  companyId?: string;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

// Payment Response según backend
export interface PaymentResponse {
  id: string; // UUID
  invoiceId: string; // UUID
  invoiceNumber: string;
  amount: number;
  date: string; // ISO 8601 date
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  isReconciled: boolean;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

// Financial Reports según backend
export interface BalanceSheetResponse {
  asOfDate: string; // ISO 8601 date
  assets: number;
  liabilities: number;
  equity: number;
  totalLiabilitiesAndEquity: number;
}

export interface IncomeStatementResponse {
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  revenue: number;
  expenses: number;
  netIncome: number;
}

export interface CashFlowResponse {
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  cashFromOperations: number;
  cashFromSales: number;
  netCashFlow: number;
}

export interface ProfitabilityResponse {
  profitMargin: number; // Porcentaje
  roi: number; // Porcentaje
  revenueGrowth: number; // Porcentaje
}
