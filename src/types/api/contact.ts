// Contact Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type ContactType =
  | 'CUSTOMER'
  | 'PROSPECT'
  | 'PARTNER'
  | 'VENDOR';

export type CompanySize =
  | 'STARTUP'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'ENTERPRISE';

export type Industry =
  | 'TECHNOLOGY'
  | 'FINANCE'
  | 'HEALTHCARE'
  | 'RETAIL'
  | 'MANUFACTURING'
  | 'CONSULTING'
  | 'EDUCATION'
  | 'REAL_ESTATE'
  | 'OTHER';

// Tag Response según backend
export interface TagResponse {
  id: string; // UUID
  name: string;
  color: string; // Hex color
}

// Contact Response según backend
export interface ContactResponse {
  id: string; // UUID
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  type: ContactType;
  companyId?: string; // UUID
  companyName?: string;
  ownerId?: string; // UUID
  ownerName?: string;
  tags?: TagResponse[];
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateContactRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  type: ContactType;
  companyId?: string;
  ownerId?: string;
  tagIds?: string[]; // Array of tag UUIDs
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  type?: ContactType;
  companyId?: string;
  ownerId?: string;
  tagIds?: string[];
}

// Company Response según backend
export interface CompanyResponse {
  id: string; // UUID
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  industry?: Industry;
  size?: CompanySize;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  ownerId?: string; // UUID
  ownerName?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

export interface CreateCompanyRequest {
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  industry?: Industry;
  size?: CompanySize;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  ownerId?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  email?: string;
  phone?: string;
  industry?: Industry;
  size?: CompanySize;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  ownerId?: string;
}
