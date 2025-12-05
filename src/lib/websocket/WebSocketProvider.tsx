'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { webSocketService, WebSocketMessage, WS_CHANNELS } from './websocket-service';
import { useAuthRestore } from '@/hooks/useAuthRestore';
import { getToken } from '@/lib/auth/token';

interface WebSocketContextType {
  connected: boolean;
  subscribe: (channel: string, callback: (message: WebSocketMessage) => void) => () => void;
  send: (channel: string, body: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const { user } = useAuthRestore();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = webSocketService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Conectar cuando el usuario esté autenticado
    if (user) {
      const currentToken = getToken();
      
      // Si el token cambió, reconectar
      if (currentToken !== lastTokenRef.current && lastTokenRef.current !== null) {
        webSocketService.reconnect();
      } else {
        webSocketService.connect();
      }
      
      lastTokenRef.current = currentToken;
    } else {
      // Desconectar si no hay usuario
      webSocketService.disconnect();
      lastTokenRef.current = null;
    }
  }, [user]);

  const subscribe = useCallback(
    (channel: string, callback: (message: WebSocketMessage) => void) => {
      return webSocketService.subscribe(channel, callback);
    },
    []
  );

  const send = useCallback((channel: string, body: unknown) => {
    webSocketService.send(channel, body);
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Re-export WS_CHANNELS for convenience
export { WS_CHANNELS } from './websocket-service';

// Hook específico para notificaciones
export function useNotifications() {
  const { subscribe, connected } = useWebSocket();
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.NOTIFICATIONS, (message) => {
      setNotifications((prev) => [message, ...prev].slice(0, 50)); // Mantener últimas 50
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return { notifications, connected };
}

// Hook para oportunidades de ventas
export function useSalesOpportunitiesUpdates() {
  const { subscribe, connected } = useWebSocket();
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SALES_OPPORTUNITIES, (message) => {
      setUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return { updates, connected };
}

// Hook para tickets de soporte
export function useSupportTicketsUpdates() {
  const { subscribe, connected } = useWebSocket();
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SUPPORT_TICKETS, (message) => {
      setUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return { updates, connected };
}

// Hook para facturas
export function useFinanceInvoicesUpdates() {
  const { subscribe, connected } = useWebSocket();
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.FINANCE_INVOICES, (message) => {
      setUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return { updates, connected };
}

// Hook para contactos
export function useContactsUpdates() {
  const { subscribe, connected } = useWebSocket();
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.CONTACTS, (message) => {
      setUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return { updates, connected };
}

// Hook para logs de auditoría
export function useAuditLogsUpdates() {
  const { subscribe, connected } = useWebSocket();
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.AUDIT_LOGS, (message) => {
      setUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return { updates, connected };
}

