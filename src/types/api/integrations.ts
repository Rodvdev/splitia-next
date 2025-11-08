// Integrations Types

export type IntegrationStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type WebhookStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export interface ApiKeyResponse {
  id: string;
  name: string;
  key: string;
  prefix: string;
  lastUsedAt?: string;
  expiresAt?: string;
  permissions: string[];
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: string;
  permissions: string[];
}

export interface WebhookResponse {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  secret?: string;
  lastTriggeredAt?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}

export interface WebhookLogResponse {
  id: string;
  webhookId: string;
  webhook?: WebhookResponse;
  event: string;
  payload: Record<string, any>;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  triggeredAt: string;
}

export interface IntegrationResponse {
  id: string;
  name: string;
  type: 'SLACK' | 'NOTION' | 'GOOGLE_SHEETS' | 'ZAPIER' | 'MAKE' | 'CUSTOM';
  status: IntegrationStatus;
  config: Record<string, any>;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationRequest {
  name: string;
  type: 'SLACK' | 'NOTION' | 'GOOGLE_SHEETS' | 'ZAPIER' | 'MAKE' | 'CUSTOM';
  config: Record<string, any>;
}

export interface ConnectorConfig {
  slack?: {
    webhookUrl: string;
    channel?: string;
  };
  notion?: {
    apiKey: string;
    databaseId?: string;
  };
  googleSheets?: {
    credentials: Record<string, any>;
    spreadsheetId?: string;
  };
  zapier?: {
    webhookUrl: string;
  };
  make?: {
    webhookUrl: string;
  };
}

