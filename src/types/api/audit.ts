import { UserResponse } from './user';

// Audit Log types
export interface AuditLogResponse {
  id: string;
  action: string;                      // CREATE, UPDATE, DELETE, LOGIN, etc.
  entityType: string;                  // User, Group, Invoice, etc.
  entityId?: string;                   // UUID del entidad afectada
  userId: string;                      // UUID del usuario que realizó la acción
  user?: UserResponse;                 // Usuario (expandido)
  changes?: Record<string, { old: any; new: any }>; // Cambios realizados
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;       // Metadatos adicionales
  createdAt: string;                   // ISO 8601 datetime
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Compliance types
export interface DataExportRequest {
  userId?: string;
  dataType: 'USER_DATA' | 'ALL_DATA';
  format: 'JSON' | 'CSV';
}

export interface DataExportResponse {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface DataDeletionRequest {
  userId: string;
  reason?: string;
}

export interface ConsentResponse {
  id: string;
  userId: string;
  type: 'MARKETING' | 'ANALYTICS' | 'COOKIES' | 'DATA_PROCESSING';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  createdAt: string;
}

