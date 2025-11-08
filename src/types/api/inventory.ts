// Inventory Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type ProductType =
  | 'GOOD'
  | 'SERVICE';

export type StockMovementType =
  | 'IN'
  | 'OUT'
  | 'RETURN'
  | 'ADJUSTMENT';

// Stock Response según backend
export interface StockResponse {
  id: string; // UUID
  productId: string; // UUID
  productName: string;
  productSku: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location: string;
  isLowStock: boolean;
}

// Product Variant según backend
export interface ProductVariantResponse {
  id: string; // UUID
  sku: string;
  name: string;
  price: number;
  cost: number;
  attributes: string; // JSON string
}

// Product Response según backend
export interface ProductResponse {
  id: string; // UUID
  sku: string;
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  cost: number;
  currency: string;
  category?: string;
  images?: string[];
  stock?: StockResponse;
  variants?: ProductVariantResponse[];
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  cost: number;
  currency?: string; // Default: 'USD'
  category?: string;
  images?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  variants?: {
    sku: string;
    name: string;
    price: number;
    cost: number;
    attributes: string; // JSON string
  }[];
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  type?: ProductType;
  price?: number;
  cost?: number;
  currency?: string;
  category?: string;
  images?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  variants?: {
    sku: string;
    name: string;
    price: number;
    cost: number;
    attributes: string;
  }[];
}

// Stock Movement Response según backend
export interface StockMovementResponse {
  id: string; // UUID
  productId: string; // UUID
  productName: string;
  productSku: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  date: string; // ISO 8601 date
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateStockMovementRequest {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  date: string;
}

// Product Category Response (si existe en backend)
export interface ProductCategoryResponse {
  id: string; // UUID
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
}
