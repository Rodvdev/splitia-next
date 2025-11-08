// Constantes compartidas para tickets de soporte

export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  PENDING_CUSTOMER: 'Esperando Cliente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

export const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Solicitud',
  BUG_REPORT: 'Error',
  ACCOUNT: 'Cuenta',
  GENERAL: 'General',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const PRIORITY_VARIANTS: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  LOW: 'outline',
  MEDIUM: 'default',
  HIGH: 'secondary',
  URGENT: 'destructive',
};

export const STATUS_VARIANTS: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  OPEN: 'default',
  IN_PROGRESS: 'secondary',
  PENDING_CUSTOMER: 'outline',
  RESOLVED: 'default',
  CLOSED: 'outline',
};

export const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-yellow-600',
  IN_PROGRESS: 'text-blue-600',
  RESOLVED: 'text-green-600',
  URGENT: 'text-red-600',
};

