export const CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'BRL', 'ARS', 'CLP', 'COP'] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
] as const;

export const EXPENSE_SHARE_TYPES = ['EQUAL', 'PERCENTAGE', 'FIXED'] as const;

export const GROUP_ROLES = ['ADMIN', 'MEMBER', 'GUEST', 'ASSISTANT'] as const;

export const SETTLEMENT_STATUSES = ['PENDING', 'PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

export const SETTLEMENT_TYPES = ['PAYMENT', 'RECEIPT'] as const;

export const SUBSCRIPTION_PLANS = ['FREE', 'PREMIUM', 'ENTERPRISE'] as const;

export const TICKET_CATEGORIES = ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT', 'ACCOUNT', 'GENERAL'] as const;

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED'] as const;

