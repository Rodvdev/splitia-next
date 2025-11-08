import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from '@/lib/auth/token';

// WebSocket Message según estructura del backend
export type WebSocketMessage = {
  type: string; // Tipo de evento (ej: "OPPORTUNITY_CREATED")
  module: string; // Módulo (ej: "CRM", "FINANCE", "INVENTORY")
  action: string; // Acción (ej: "CREATED", "UPDATED", "STATUS_CHANGED")
  entityId: string | null; // ID de la entidad afectada
  entityType: string; // Tipo de entidad (ej: "Opportunity", "Invoice")
  data: Record<string, any>; // Datos adicionales del evento
  userId: string | null; // ID del usuario que disparó el evento
  timestamp: string; // Timestamp ISO 8601
  message: string | null; // Mensaje opcional
};

export type WebSocketSubscription = {
  id: string;
  destination: string;
  callback: (message: WebSocketMessage) => void;
};

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000;
  private isConnecting = false;
  private isConnected = false;
  private listeners: Set<(connected: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeClient();
    }
  }

  private initializeClient() {
    // IMPORTANTE: SockJS usa HTTP/HTTPS, NO ws:// o wss://
    // SockJS automáticamente usa WSS cuando la URL es HTTPS
    // 
    // Cómo funciona WSS con SockJS:
    // - https://localhost:8080/ws -> SockJS usa WSS automáticamente
    // - http://localhost:8080/ws -> SockJS usa WebSocket normal (no seguro)
    // - NO uses wss:// directamente, usa https://
    //
    // Backend disponible en:
    // - HTTPS: https://localhost:8080
    // - WSS: wss://localhost:8080/ws (SockJS usa https://localhost:8080/ws)
    //
    // Configuración soportada:
    // - https://localhost:8080 -> WSS (backend con SSL habilitado) ✅ RECOMENDADO
    // - http://localhost:8080 -> HTTP (backend sin SSL, solo desarrollo)
    // - https://api.splitia.com -> WSS (producción)
    // - http://api.splitia.com (página HTTPS) -> se actualiza a HTTPS/WSS automáticamente
    //
    // Obtener la URL base del API desde variables de entorno
    // Para usar WSS en localhost, configura: NEXT_PUBLIC_API_URL=https://localhost:8080/api
    let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Convertir wss:// a https:// si alguien lo especifica por error
    // SockJS no acepta wss:// directamente, necesita https://
    if (API_URL.startsWith('wss://')) {
      API_URL = API_URL.replace('wss://', 'https://');
      console.warn('⚠️ wss:// detectado. Convertido a https:// (SockJS requiere https:// para WSS)');
    }
    if (API_URL.startsWith('ws://')) {
      API_URL = API_URL.replace('ws://', 'http://');
      console.warn('⚠️ ws:// detectado. Convertido a http:// (SockJS requiere http://)');
    }
    
    // Detectar si la página está cargada sobre HTTPS
    const isSecurePage = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    // Remover /api si existe y construir URL base
    // http://localhost:8080/api -> http://localhost:8080
    // https://api.splitia.com/api -> https://api.splitia.com
    let baseUrl = API_URL.replace('/api', '');
    
    // Detectar si es localhost
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    
    // Detectar si la URL ya especifica HTTPS (backend con SSL habilitado)
    const isExplicitlyHttps = baseUrl.startsWith('https://');
    const isExplicitlyHttp = baseUrl.startsWith('http://');
    
    // Si la URL ya especifica HTTPS, respetarla (backend tiene SSL/WSS habilitado)
    // Si es localhost con HTTP explícito, mantener HTTP (backend sin SSL)
    // Si es producción con HTTP y página HTTPS, actualizar a HTTPS
    if (isExplicitlyHttps) {
      // URL ya especifica HTTPS - respetar configuración (backend tiene SSL/WSS)
      console.log('🔒 URL HTTPS detectada. Usando WSS (WebSocket Secure).');
    } else if (isLocalhost && isExplicitlyHttp) {
      // Localhost con HTTP explícito - mantener HTTP (backend sin SSL)
      console.log('🔧 Localhost HTTP detectado. Usando HTTP (backend sin SSL).');
    } else if (isSecurePage && !isLocalhost && isExplicitlyHttp) {
      // Producción con HTTP y página HTTPS - actualizar a HTTPS
      baseUrl = baseUrl.replace('http://', 'https://');
      console.log('🔒 Página HTTPS detectada. Actualizando URL del WebSocket a HTTPS/WSS');
    } else if (isSecurePage && !baseUrl.startsWith('http')) {
      // Sin protocolo especificado y página HTTPS - usar HTTPS
      baseUrl = `https://${baseUrl}`;
      console.log('🔒 Página HTTPS detectada. Agregando protocolo HTTPS/WSS a la URL del WebSocket');
    }
    
    const wsUrl = `${baseUrl}/ws`;
    const protocol = wsUrl.startsWith('https://') ? 'WSS (WebSocket Secure)' : 'HTTP';
    const protocolNote = wsUrl.startsWith('https://') 
      ? 'SockJS usará WSS automáticamente sobre HTTPS' 
      : 'SockJS usará WebSocket normal sobre HTTP';
    console.log(`🔌 Inicializando WebSocket en: ${wsUrl}`);
    console.log(`   Protocolo: ${protocol} - ${protocolNote}`);

    this.client = new Client({
      webSocketFactory: () => {
        return new SockJS(wsUrl) as any;
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('🔌 WebSocket conectado');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyListeners(true);
        this.resubscribeAll();
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket desconectado');
        this.isConnected = false;
        this.notifyListeners(false);
      },
      onStompError: (frame) => {
        console.error('❌ Error STOMP:', frame);
        this.handleReconnect();
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket cerrado');
        this.isConnected = false;
        this.notifyListeners(false);
        this.handleReconnect();
      },
      beforeConnect: () => {
        const token = getToken();
        if (token && this.client) {
          this.client.configure({
            connectHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      },
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isConnecting) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000);
      console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected && !this.isConnecting) {
          this.connect();
        }
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
    }
  }

  private resubscribeAll() {
    // Las suscripciones se manejan externamente a través de los hooks
    // Este método puede usarse para re-suscribirse si es necesario
  }

  connect(): void {
    if (typeof window === 'undefined') return;
    
    if (this.isConnecting || this.isConnected) {
      return;
    }

    if (!this.client) {
      this.initializeClient();
    }

    if (this.client && !this.client.active) {
      this.isConnecting = true;
      // Configurar token antes de conectar
      const token = getToken();
      if (token && this.client) {
        this.client.configure({
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      this.client.activate();
    }
  }

  reconnect(): void {
    this.disconnect();
    setTimeout(() => {
      this.reconnectAttempts = 0;
      this.connect();
    }, 1000);
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  subscribe(
    destination: string,
    callback: (message: WebSocketMessage) => void
  ): () => void {
    if (!this.client || !this.isConnected) {
      console.warn(`⚠️ No conectado. Suscripción a ${destination} será establecida cuando se conecte.`);
      // Guardar la suscripción para cuando se conecte
      const checkConnection = setInterval(() => {
        if (this.isConnected && this.client) {
          clearInterval(checkConnection);
          this.doSubscribe(destination, callback);
        }
      }, 500);
      return () => clearInterval(checkConnection);
    }

    return this.doSubscribe(destination, callback);
  }

  private doSubscribe(
    destination: string,
    callback: (message: WebSocketMessage) => void
  ): () => void {
    if (!this.client || !this.isConnected) {
      return () => {};
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        
        // Log para depuración
        console.log(`📨 Mensaje WebSocket recibido en ${destination}:`, data);
        
        // Manejar diferentes formatos de mensaje del backend
        // Formato 1: Estructura estándar WebSocketMessage
        // Formato 2: Mensaje directo (para chat)
        // Formato 3: Mensaje dentro de data.message o data.data
        
        let normalizedData = data;
        
        // Si el mensaje está dentro de data.message o data.data, extraerlo
        if (data.data?.message) {
          normalizedData = { ...data, data: { ...data.data, message: data.data.message } };
        } else if (data.message && typeof data.message === 'object') {
          // El mensaje completo está en data.message
          normalizedData = { ...data, data: { message: data.message, ...data.data } };
        }
        
        // Normalizar mensaje según estructura del backend
        callback({
          type: normalizedData.type || data.type || 'MESSAGE',
          module: normalizedData.module || data.module || 'UNKNOWN',
          action: normalizedData.action || data.action || 'UNKNOWN',
          entityId: normalizedData.entityId || data.entityId || null,
          entityType: normalizedData.entityType || data.entityType || 'UNKNOWN',
          data: normalizedData.data || data.data || data || {},
          userId: normalizedData.userId || data.userId || null,
          timestamp: normalizedData.timestamp || data.timestamp || new Date().toISOString(),
          message: normalizedData.message || data.message || null,
        });
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        console.error('Raw message body:', message.body);
        callback({
          type: 'ERROR',
          module: 'SYSTEM',
          action: 'PARSE_ERROR',
          entityId: null,
          entityType: 'ERROR',
          data: { error: 'Failed to parse message', raw: message.body },
          userId: null,
          timestamp: new Date().toISOString(),
          message: 'Error parsing WebSocket message',
        });
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`✅ Suscrito a ${destination}`);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`❌ Desuscrito de ${destination}`);
    };
  }

  send(destination: string, body: any): void {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ No conectado. No se puede enviar mensaje.');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(connected: boolean) {
    this.listeners.forEach((listener) => listener(connected));
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// WebSocket channels/topics
export const WS_CHANNELS = {
  // Notificaciones globales
  NOTIFICATIONS: '/topic/notifications',
  
  // CRM - Sales
  SALES_OPPORTUNITIES: '/topic/sales/opportunities',
  SALES_LEADS: '/topic/sales/leads',
  
  // CRM - Contacts
  CONTACTS: '/topic/crm/contacts',
  COMPANIES: '/topic/crm/companies',
  
  // Sales - Activities
  SALES_ACTIVITIES: '/topic/sales/activities',
  SALES_PIPELINE: '/topic/sales/pipeline',
  
  // Support
  SUPPORT_TICKETS: '/topic/support/tickets',
  SUPPORT_MESSAGES: '/topic/support/messages',
  
  // Chat / Conversations
  CHAT_MESSAGES: '/topic/chat/messages',
  CONVERSATIONS: '/topic/conversations',
  CONVERSATION_MESSAGES: (conversationId: string) => `/topic/conversations/${conversationId}/messages`,
  
  // Finance
  FINANCE_INVOICES: '/topic/finance/invoices',
  FINANCE_PAYMENTS: '/topic/finance/payments',
  
  // Inventory
  INVENTORY_PRODUCTS: '/topic/inventory/products',
  INVENTORY_ALERTS: '/topic/inventory/alerts',
  INVENTORY_MOVEMENTS: '/topic/inventory/movements',
  
  // Procurement
  PROCUREMENT_VENDORS: '/topic/procurement/vendors',
  PROCUREMENT_PURCHASE_ORDERS: '/topic/procurement/purchase-orders',
  
  // HR
  HR_EMPLOYEES: '/topic/hr/employees',
  HR_ATTENDANCE: '/topic/hr/attendance',
  HR_ALERTS: '/topic/hr/alerts',
  HR_PAYROLL: '/topic/hr/payroll',
  
  // Projects
  PROJECTS: '/topic/projects',
  PROJECTS_TIME_ENTRIES: '/topic/projects/time-entries',
  TASKS: '/topic/tasks',
  
  // Marketing
  MARKETING_CAMPAIGNS: '/topic/marketing/campaigns',
  
  // SLA
  SLA_ALERTS: '/topic/sla/alerts',
  
  // Workflows
  WORKFLOWS: '/topic/workflows',
  
  // Audit
  AUDIT_LOGS: '/topic/audit/logs',
  
  // User-specific channels
  userNotifications: (userId: string) => `/queue/user/${userId}/notifications`,
  userActivity: (userId: string) => `/queue/user/${userId}/activity`,
} as const;

