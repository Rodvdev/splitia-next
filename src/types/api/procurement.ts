// Procurement Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'ORDERED'
  | 'RECEIVED'
  | 'CANCELLED';

export type PaymentTerms =
  | 'NET_15'
  | 'NET_30'
  | 'NET_45'
  | 'NET_60'
  | 'DUE_ON_RECEIPT'
  | 'PREPAID';

// Vendor Response según backend
export interface VendorResponse {
  id: string; // UUID
  name: string;
  contactName?: string;
  email?: string;
  phoneNumber?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: PaymentTerms;
  rating?: number; // 1-5
  notes?: string;
  createdById?: string; // UUID
  createdByName?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateVendorRequest {
  name: string;
  contactName?: string;
  email?: string;
  phoneNumber?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: PaymentTerms;
  rating?: number;
  notes?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  contactName?: string;
  email?: string;
  phoneNumber?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: PaymentTerms;
  rating?: number;
  notes?: string;
}

// Purchase Order Item según backend
export interface PurchaseOrderItemResponse {
  id: string; // UUID
  productId: string; // UUID
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedQuantity: number;
}

// Purchase Order Response según backend
export interface PurchaseOrderResponse {
  id: string; // UUID
  orderNumber: string;
  vendorId: string; // UUID
  vendorName: string;
  orderDate: string; // ISO 8601 date
  expectedDate?: string; // ISO 8601 date
  status: PurchaseOrderStatus;
  total: number;
  createdById?: string; // UUID
  createdByName?: string;
  notes?: string;
  items: PurchaseOrderItemResponse[];
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreatePurchaseOrderRequest {
  orderNumber?: string; // Opcional - se genera automáticamente si no se proporciona
  vendorId: string;
  orderDate: string;
  expectedDate?: string;
  status?: PurchaseOrderStatus; // Default: 'DRAFT'
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdatePurchaseOrderRequest {
  orderNumber?: string;
  vendorId?: string;
  orderDate?: string;
  expectedDate?: string;
  status?: PurchaseOrderStatus;
  notes?: string;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

// Receive Purchase Order Request según backend
export interface ReceivePurchaseOrderRequest {
  [itemId: string]: number; // Mapea itemId (UUID) a quantity recibida
}
