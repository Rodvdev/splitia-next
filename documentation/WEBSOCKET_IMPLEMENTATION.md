# WebSocket Implementation - Splitia CRM/ERP

## Arquitectura

El sistema WebSocket está implementado usando **SockJS + STOMP** para comunicación en tiempo real entre el frontend (Next.js) y el backend (Spring Boot).

## Estructura

```
src/lib/websocket/
├── websocket-service.ts    # Servicio singleton para gestión de conexión
└── WebSocketProvider.tsx    # Context Provider y hooks personalizados
```

## Componentes Principales

### 1. WebSocketService (`websocket-service.ts`)

Servicio singleton que gestiona:
- Conexión y desconexión automática
- Reconexión automática con backoff exponencial
- Suscripciones a canales STOMP
- Envío de mensajes
- Autenticación con JWT token

**Características:**
- ✅ Reconexión automática (hasta 10 intentos)
- ✅ Heartbeat para mantener conexión viva
- ✅ Manejo de errores robusto
- ✅ Autenticación con token JWT
- ✅ Logs en consola para debugging

### 2. WebSocketProvider (`WebSocketProvider.tsx`)

Context Provider que:
- Conecta automáticamente cuando el usuario está autenticado
- Desconecta cuando el usuario cierra sesión
- Proporciona hooks personalizados para diferentes módulos
- Maneja reconexión cuando el token cambia

## Canales WebSocket Disponibles

```typescript
WS_CHANNELS = {
  // Notificaciones globales
  NOTIFICATIONS: '/topic/notifications',
  
  // CRM - Sales
  SALES_OPPORTUNITIES: '/topic/sales/opportunities',
  SALES_LEADS: '/topic/sales/leads',
  SALES_ACTIVITIES: '/topic/sales/activities',
  SALES_PIPELINE: '/topic/sales/pipeline',
  
  // CRM - Contacts
  CONTACTS: '/topic/crm/contacts',
  COMPANIES: '/topic/crm/companies',
  
  // Support
  SUPPORT_TICKETS: '/topic/support/tickets',
  SUPPORT_MESSAGES: '/topic/support/messages',
  
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
  
  // User-specific (requiere userId)
  userNotifications: (userId: string) => `/queue/user/${userId}/notifications`,
  userActivity: (userId: string) => `/queue/user/${userId}/activity`,
}
```

## Uso en Componentes

### Hook Básico

```typescript
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

function MyComponent() {
  const { subscribe, send, connected } = useWebSocket();

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SALES_OPPORTUNITIES, (message) => {
      const { type, action, entityId, data } = message;
      
      // Manejar diferentes tipos de eventos
      if (type === 'OPPORTUNITY_CREATED' || action === 'CREATED') {
        const opportunity = data.opportunity || data;
        // Actualizar estado con nueva oportunidad
      } else if (type === 'OPPORTUNITY_UPDATED' || action === 'UPDATED') {
        const opportunity = data.opportunity || data;
        // Actualizar oportunidad existente
      } else if (type === 'OPPORTUNITY_STAGE_CHANGED' || action === 'STATUS_CHANGED') {
        const { oldStage, newStage } = data;
        // Actualizar etapa de oportunidad
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);
}
```

### Hooks Especializados

```typescript
// Notificaciones
import { useNotifications } from '@/lib/websocket/WebSocketProvider';
const { notifications, connected } = useNotifications();

// Oportunidades de ventas
import { useSalesOpportunitiesUpdates } from '@/lib/websocket/WebSocketProvider';
const { updates, connected } = useSalesOpportunitiesUpdates();

// Tickets de soporte
import { useSupportTicketsUpdates } from '@/lib/websocket/WebSocketProvider';
const { updates, connected } = useSupportTicketsUpdates();
```

## Formato de Mensajes

Todos los mensajes siguen la estructura definida por el backend:

```typescript
interface WebSocketMessage {
  type: string;           // Tipo de evento (ej: "OPPORTUNITY_CREATED")
  module: string;         // Módulo (ej: "CRM", "FINANCE", "INVENTORY")
  action: string;         // Acción (ej: "CREATED", "UPDATED", "STATUS_CHANGED")
  entityId: string | null; // ID de la entidad afectada
  entityType: string;     // Tipo de entidad (ej: "Opportunity", "Invoice")
  data: Record<string, any>; // Datos adicionales del evento
  userId: string | null;  // ID del usuario que disparó el evento
  timestamp: string;      // Timestamp ISO 8601
  message: string | null; // Mensaje opcional
}
```

### Ejemplo de Mensaje

```json
{
  "type": "OPPORTUNITY_CREATED",
  "module": "CRM",
  "action": "CREATED",
  "entityId": "uuid-123",
  "entityType": "Opportunity",
  "data": {
    "opportunity": {
      "id": "uuid-123",
      "name": "Enterprise Deal",
      "stage": "LEAD",
      "estimatedValue": 50000.00
    }
  },
  "userId": "user-uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "message": null
}
```

### Tipos de Eventos Comunes

**CRM - Oportunidades:**
- `OPPORTUNITY_CREATED` - Nueva oportunidad creada (`data.opportunity`)
- `OPPORTUNITY_UPDATED` - Oportunidad actualizada (`data.opportunity`)
- `OPPORTUNITY_DELETED` - Oportunidad eliminada (`entityId`)
- `OPPORTUNITY_STAGE_CHANGED` - Cambio de etapa (`data.oldStage`, `data.newStage`)

**CRM - Leads:**
- `LEAD_CREATED` - Nuevo lead creado (`data.lead`)
- `LEAD_CONVERTED` - Lead convertido a oportunidad (`data.opportunity`)

**CRM - Activities:**
- `ACTIVITY_CREATED` - Nueva actividad creada (`data.activity`)

**CRM - Contactos:**
- `CONTACT_CREATED` - Nuevo contacto creado (`data.contact`)
- `CONTACT_UPDATED` - Contacto actualizado (`data.contact`)
- `CONTACT_DELETED` - Contacto eliminado (`entityId`)

**CRM - Empresas:**
- `COMPANY_CREATED` - Nueva empresa creada (`data.company`)

**Finance - Facturas:**
- `INVOICE_CREATED` - Nueva factura creada (`data.invoice`)
- `INVOICE_UPDATED` - Factura actualizada (`data.invoice`)
- `INVOICE_PAID` - Factura pagada (`data.invoice`, `data.payment`)
- `INVOICE_STATUS_CHANGED` - Cambio de estado (`data.status`)

**Finance - Pagos:**
- `PAYMENT_RECEIVED` - Pago recibido (`data.payment`)

**Inventory:**
- `PRODUCT_CREATED` - Nuevo producto creado (`data.product`)
- `PRODUCT_UPDATED` - Producto actualizado (`data.product`)
- `STOCK_LOW` - Alerta de stock bajo (`data.productId`, `data.productName`, `data.currentQuantity`, `data.minQuantity`)
- `STOCK_MOVEMENT` - Movimiento de stock (`data.movement`)

**Procurement:**
- `VENDOR_CREATED` - Nuevo proveedor creado (`data.vendor`)
- `PURCHASE_ORDER_CREATED` - Nueva orden de compra (`data.purchaseOrder`)
- `PURCHASE_ORDER_STATUS_CHANGED` - Cambio de estado (`data.oldStatus`, `data.newStatus`)

**HR:**
- `EMPLOYEE_CREATED` - Nuevo empleado creado (`data.employee`)
- `ATTENDANCE_CREATED` - Registro de asistencia (`data.attendance`)
- `ATTENDANCE_ALERT` - Alerta de asistencia (`data.alert`)
- `PAYROLL_GENERATED` - Nómina generada (`data.payroll`)

**Projects:**
- `PROJECT_UPDATED` - Proyecto actualizado (`data.project`)
- `PROJECT_STATUS_CHANGED` - Cambio de estado (`data.oldStatus`, `data.newStatus`)
- `TIME_ENTRY_CREATED` - Nuevo registro de tiempo (`data.timeEntry`)

**Support - Tickets:**
- `TICKET_CREATED` - Nuevo ticket creado (`data.ticket`)
- `TICKET_UPDATED` - Ticket actualizado (`data.ticket`)
- `TICKET_STATUS_CHANGED` - Cambio de estado (`data.oldStatus`, `data.newStatus`)

**Notificaciones Globales:**
- `USER_CREATED` - Nuevo usuario registrado (`data.user`)
- `GROUP_CREATED` - Nuevo grupo creado (`data.group`)
- `SUBSCRIPTION_CREATED` - Nueva suscripción (`data.subscription`)
- `SUBSCRIPTION_UPDATED` - Suscripción actualizada (`data.subscription`)
- `GLOBAL_NOTIFICATION` - Notificación global (`data.notification`)

## Envío de Mensajes

```typescript
const { send } = useWebSocket();

// Enviar mensaje a un canal
send('/app/chat/send', {
  content: 'Mensaje de prueba',
  conversationId: '123',
});
```

## Configuración del Backend

El backend debe estar configurado con:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*") // En producción, especificar dominio
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

## Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**IMPORTANTE:** SockJS usa HTTP/HTTPS, NO el protocolo `ws://` o `wss://`

El servicio WebSocket construye la URL correctamente:
- `http://localhost:8080/api` → `http://localhost:8080/ws` ✅
- `https://api.splitia.com/api` → `https://api.splitia.com/ws` ✅

**URLs INCORRECTAS (no usar):**
- `ws://localhost:8080/ws` ❌
- `wss://api.splitia.com/ws` ❌

## Indicadores Visuales

- **WebSocketStatus**: Badge en el header mostrando estado de conexión
- **NotificationsBell**: Campana de notificaciones con contador de no leídas

## Manejo de Errores

- Reconexión automática con backoff exponencial
- Logs en consola para debugging
- Notificaciones toast para eventos importantes
- Estado visual de conexión en el header

## Mejores Prácticas

1. **Siempre limpiar suscripciones**: Usar el cleanup del useEffect
2. **Verificar conexión**: Comprobar `connected` antes de suscribirse
3. **Manejar estados de carga**: Mostrar indicadores mientras se conecta
4. **Optimistic updates**: Actualizar UI inmediatamente, luego sincronizar con backend
5. **Límites de mensajes**: Mantener solo los últimos N mensajes en memoria
6. **Estructura de mensajes**: Siempre acceder a `data.opportunity`, `data.invoice`, etc., según el tipo de entidad
7. **Manejo de acciones**: Verificar tanto `type` como `action` para compatibilidad
8. **URLs correctas**: Usar HTTP/HTTPS para SockJS, nunca ws:// o wss://

## Debugging

Los logs en consola muestran:
- 🔌 Conexión/desconexión
- ✅ Suscripciones exitosas
- ❌ Errores y desuscripciones
- 🔄 Intentos de reconexión

## Ejemplo Completo de Uso

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';
import { OpportunityResponse } from '@/types';
import { toast } from 'sonner';

export function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SALES_OPPORTUNITIES, (message) => {
      const { type, action, entityId, data } = message;
      
      if (type === 'OPPORTUNITY_CREATED' || action === 'CREATED') {
        const opportunity = data.opportunity || data as OpportunityResponse;
        setOpportunities((prev) => {
          const existingIndex = prev.findIndex((o) => o.id === opportunity.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = opportunity;
            return updated;
          } else {
            return [opportunity, ...prev];
          }
        });
        toast.success(`Nueva oportunidad: ${opportunity.name}`);
      } else if (type === 'OPPORTUNITY_UPDATED' || action === 'UPDATED') {
        const opportunity = data.opportunity || data as OpportunityResponse;
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opportunity.id ? opportunity : o))
        );
      } else if (type === 'OPPORTUNITY_DELETED' || action === 'DELETED') {
        const id = entityId || data.id;
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        toast.info('Oportunidad eliminada');
      } else if (type === 'OPPORTUNITY_STAGE_CHANGED' || action === 'STATUS_CHANGED') {
        const id = entityId || data.id;
        const stage = data.newStage || data.stage;
        setOpportunities((prev) =>
          prev.map((o) => (o.id === id ? { ...o, stage } : o))
        );
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);

  return (
    <div>
      {connected && <p>Conectado en tiempo real</p>}
      {/* Renderizar oportunidades */}
    </div>
  );
}
```

## Próximas Mejoras

- [ ] Persistencia de mensajes en localStorage
- [ ] Compresión de mensajes grandes
- [ ] Rate limiting en el cliente
- [ ] Métricas de conexión (latencia, mensajes por segundo)
- [ ] Soporte para múltiples conexiones simultáneas
- [ ] Manejo de reconexión mejorado con estado persistente

