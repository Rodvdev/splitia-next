// Projects Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type ProjectStatus =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type TimeEntryStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

// Project Response según backend
export interface ProjectResponse {
  id: string; // UUID
  name: string;
  description?: string;
  startDate?: string; // ISO 8601 date
  endDate?: string; // ISO 8601 date
  status: ProjectStatus;
  budget?: number;
  managerId?: string; // UUID
  managerName?: string;
  taskIds?: string[]; // Array of task UUIDs
  totalTasks?: number;
  totalHours?: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus; // Default: 'PLANNING'
  budget?: number;
  managerId?: string;
  taskIds?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  budget?: number;
  managerId?: string;
  taskIds?: string[];
}

// Time Entry Response según backend
export interface TimeEntryResponse {
  id: string; // UUID
  projectId: string; // UUID
  projectName: string;
  taskId?: string; // UUID
  taskTitle?: string;
  userId: string; // UUID
  userName: string;
  date: string; // ISO 8601 date
  hours: number;
  description?: string;
  isBillable: boolean;
  status: TimeEntryStatus;
}

export interface CreateTimeEntryRequest {
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
  isBillable?: boolean; // Default: true
  status?: TimeEntryStatus; // Default: 'DRAFT'
}

export interface UpdateTimeEntryRequest {
  projectId?: string;
  taskId?: string;
  date?: string;
  hours?: number;
  description?: string;
  isBillable?: boolean;
  status?: TimeEntryStatus;
}
