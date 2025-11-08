// Dashboard Types

export interface KPIConfig {
  id: string;
  name: string;
  metric: string;
  aggregation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  comparison?: {
    period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    type: 'PREVIOUS' | 'SAME_LAST_YEAR';
  };
  format?: 'NUMBER' | 'CURRENCY' | 'PERCENTAGE';
  threshold?: {
    min?: number;
    max?: number;
    alert?: boolean;
  };
}

export interface DashboardWidgetConfig {
  id: string;
  type: 'KPI' | 'CHART' | 'TABLE' | 'METRIC';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export interface DashboardFilter {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'IN';
  value: any;
}

export interface DashboardConfig {
  widgets: DashboardWidgetConfig[];
  filters?: DashboardFilter[];
  refreshInterval?: number;
}

