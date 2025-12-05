/**
 * Utility function for consistent API response logging across the application
 */

export interface ApiLogOptions {
  endpoint: string;
  success: boolean;
  params?: Record<string, unknown>;
  data?: unknown;
  error?: unknown;
  emoji?: string;
}

/**
 * Logs API responses in a consistent format
 * @param options - Logging options including endpoint, success status, data, etc.
 */
export function logApiResponse(options: ApiLogOptions): void {
  const {
    endpoint,
    success,
    params,
    data,
    error,
    emoji = '📡',
  } = options;

  const logData: Record<string, unknown> = {
    endpoint,
    success,
  };

  if (params) {
    logData.params = params;
  }

  if (data) {
    logData.data = data;
  }

  if (error) {
    logData.error = error;
  }

  console.log(`${emoji} ${endpoint}:`, logData);
}

/**
 * Helper function to log API responses with common emojis
 */
export const apiLogger = {
  users: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '👤' }),
  groups: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '👥' }),
  expenses: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '💳' }),
  budgets: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '💰' }),
  settlements: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '💸' }),
  subscriptions: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '📋' }),
  support: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '🎫' }),
  conversations: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '💬' }),
  messages: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '📨' }),
  tasks: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '✅' }),
  categories: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '🏷️' }),
  plans: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '📦' }),
  tags: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '🏷️' }),
  sales: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '💼' }),
  general: (options: Omit<ApiLogOptions, 'emoji'>) =>
    logApiResponse({ ...options, emoji: '📡' }),
};


