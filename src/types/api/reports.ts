// Reports Types

export type ReportType = 'TABLE' | 'CHART' | 'METRIC' | 'DASHBOARD';
export type ChartType = 'LINE' | 'BAR' | 'PIE' | 'AREA' | 'SCATTER';
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export interface ReportResponse {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfig {
  dataSource: string;
  fields: string[];
  filters?: ReportFilter[];
  groupBy?: string[];
  aggregations?: ReportAggregation[];
  sortBy?: { field: string; direction: 'ASC' | 'DESC' }[];
  chartType?: ChartType;
  format?: ReportFormat;
}

export interface ReportFilter {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN' | 'BETWEEN';
  value: any;
}

export interface ReportAggregation {
  field: string;
  function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  alias?: string;
}

export interface CreateReportRequest {
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  isPublic?: boolean;
}

export interface DashboardResponse {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'CHART' | 'TABLE' | 'METRIC' | 'KPI';
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export interface DashboardLayout {
  columns: number;
  rows: number;
}

export interface CreateDashboardRequest {
  name: string;
  description?: string;
  widgets?: DashboardWidget[];
  layout: DashboardLayout;
  isPublic?: boolean;
}

export interface ScheduledReportResponse {
  id: string;
  reportId: string;
  report?: ReportResponse;
  schedule: string; // Cron expression
  recipients: string[];
  format: ReportFormat;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
}

