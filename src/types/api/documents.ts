// Documents Types

export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DocumentType = 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX' | 'PPT' | 'PPTX' | 'IMAGE' | 'OTHER';
export type PermissionLevel = 'VIEW' | 'EDIT' | 'DELETE' | 'SHARE';

export interface DocumentResponse {
  id: string;
  name: string;
  fileName: string;
  type: DocumentType;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  categoryId?: string;
  category?: DocumentCategoryResponse;
  tags: string[];
  status: DocumentStatus;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  name: string;
  file: File;
  categoryId?: string;
  tags?: string[];
  status?: DocumentStatus;
}

export interface DocumentVersionResponse {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  size: number;
  url: string;
  createdBy: string;
  createdAt: string;
  changes?: string;
}

export interface DocumentCategoryResponse {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  createdAt: string;
}

export interface DocumentPermissionResponse {
  id: string;
  documentId: string;
  userId?: string;
  groupId?: string;
  level: PermissionLevel;
  grantedBy: string;
  grantedAt: string;
}

export interface CreateDocumentPermissionRequest {
  documentId: string;
  userId?: string;
  groupId?: string;
  level: PermissionLevel;
}

export interface SharedLinkResponse {
  id: string;
  documentId: string;
  token: string;
  url: string;
  expiresAt?: string;
  maxAccesses?: number;
  accessCount: number;
  createdBy: string;
  createdAt: string;
}

