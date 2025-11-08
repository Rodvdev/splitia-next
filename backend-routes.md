# Backend Routes - Documentación Completa para Axios

## Información General

### Base URL
```
http://localhost:8080/api
```

### Headers Requeridos
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}'
}
```

### Formato de Respuesta Estándar
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// Para respuestas paginadas
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface Pageable {
  page?: number;      // Default: 0
  size?: number;      // Default: 20
  sort?: string;      // Ejemplo: "createdAt,desc"
}
```

### Códigos de Estado HTTP
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error de validación o solicitud inválida
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No autorizado
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## 1. Facturas (Finance) ✅

### Base Path: `/api/admin/finance`

#### Invoices

**GET** `/api/admin/finance/invoices`
- Obtener todas las facturas (paginado)
- Query params: `page`, `size`, `sort`, `status`, `contactId`, `companyId`
- Ejemplo:
```typescript
axios.get('/api/admin/finance/invoices', {
  params: {
    page: 0,
    size: 20,
    status: 'DRAFT',
    contactId: 'uuid-here'
  }
})
```

**GET** `/api/admin/finance/invoices/{id}`
- Obtener factura por ID
- Ejemplo:
```typescript
axios.get(`/api/admin/finance/invoices/${id}`)
```

**POST** `/api/admin/finance/invoices`
- Crear nueva factura
- Body:
```typescript
{
  invoiceNumber?: string;  // Auto-generado si no se proporciona
  issueDate: string;      // ISO date: "2024-01-15"
  dueDate: string;        // ISO date: "2024-02-15"
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  subtotal: number;
  tax?: number;
  total: number;
  currency?: string;      // Default: "USD"
  notes?: string;
  contactId?: string;     // UUID
  companyId?: string;     // UUID
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    total: number;
  }>;
}
```

**PUT** `/api/admin/finance/invoices/{id}`
- Actualizar factura
- Body: Similar a POST pero todos los campos opcionales

**POST** `/api/admin/finance/invoices/{id}/payments`
- Agregar pago a factura
- Body:
```typescript
{
  amount: number;
  date: string;           // ISO date
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "CHECK" | "OTHER";
  reference?: string;
  currency?: string;
  notes?: string;
}
```

**DELETE** `/api/admin/finance/invoices/{id}`
- Eliminar factura (soft delete por defecto)
- Query params: `hard=true` para eliminación permanente

#### Payments

**GET** `/api/admin/finance/payments`
- Obtener todos los pagos (paginado)
- Query params: `page`, `size`, `sort`, `invoiceId`

**GET** `/api/admin/finance/payments/{id}`
- Obtener pago por ID

**POST** `/api/admin/finance/payments`
- Crear nuevo pago
- Body:
```typescript
{
  invoiceId: string;      // UUID
  amount: number;
  date: string;           // ISO date
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "CHECK" | "OTHER";
  reference?: string;
  currency?: string;
  notes?: string;
}
```

**PUT** `/api/admin/finance/payments/{id}/reconcile`
- Conciliar pago
- Query params: `isReconciled=true` (default: true)

**DELETE** `/api/admin/finance/payments/{id}`
- Eliminar pago
- Query params: `hard=true` para eliminación permanente

#### Financial Reports

**GET** `/api/admin/finance/reports/balance-sheet`
- Obtener balance general
- Query params: `asOfDate` (ISO date, opcional)

**GET** `/api/admin/finance/reports/income-statement`
- Obtener estado de resultados
- Query params: `startDate`, `endDate` (ISO dates, opcionales)

**GET** `/api/admin/finance/reports/cash-flow`
- Obtener flujo de efectivo
- Query params: `startDate`, `endDate` (ISO dates, opcionales)

**GET** `/api/admin/finance/reports/profitability`
- Análisis de rentabilidad
- Query params: `startDate`, `endDate` (ISO dates, opcionales)

---

## 2. Auditoría (Audit) ⚠️

### Base Path: `/api/admin/audit` (Sugerido - Falta implementar controlador)

**GET** `/api/admin/audit/logs`
- Obtener logs de auditoría (paginado)
- Query params: `page`, `size`, `sort`, `entityType`, `entityId`, `userId`, `action`
- Ejemplo:
```typescript
axios.get('/api/admin/audit/logs', {
  params: {
    page: 0,
    size: 20,
    entityType: 'Invoice',
    action: 'CREATE'
  }
})
```

**GET** `/api/admin/audit/logs/{id}`
- Obtener log de auditoría por ID

**GET** `/api/admin/audit/logs/entity/{entityType}/{entityId}`
- Obtener logs de auditoría para una entidad específica

**GET** `/api/admin/audit/logs/user/{userId}`
- Obtener logs de auditoría para un usuario específico

---

## 3. Marketing (Campaigns, Automations) ⚠️

### Base Path: `/api/admin/marketing` (Sugerido - Falta implementar controlador)

#### Campaigns

**GET** `/api/admin/marketing/campaigns`
- Obtener todas las campañas (paginado)
- Query params: `page`, `size`, `sort`, `status`, `type`

**GET** `/api/admin/marketing/campaigns/{id}`
- Obtener campaña por ID

**POST** `/api/admin/marketing/campaigns`
- Crear nueva campaña
- Body:
```typescript
{
  name: string;
  type: "EMAIL" | "SOCIAL_MEDIA" | "ADVERTISEMENT" | "EVENT" | "OTHER";
  startDate?: string;    // ISO date
  endDate?: string;      // ISO date
  status?: "DRAFT" | "PENDING" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  budget?: number;
  description?: string;
}
```

**PUT** `/api/admin/marketing/campaigns/{id}`
- Actualizar campaña

**PUT** `/api/admin/marketing/campaigns/{id}/status`
- Actualizar estado de campaña
- Query params: `status`

**DELETE** `/api/admin/marketing/campaigns/{id}`
- Eliminar campaña
- Query params: `hard=true` para eliminación permanente

#### Email Templates

**GET** `/api/admin/marketing/email-templates`
- Obtener todas las plantillas de email (paginado)

**GET** `/api/admin/marketing/email-templates/{id}`
- Obtener plantilla por ID

**POST** `/api/admin/marketing/email-templates`
- Crear nueva plantilla
- Body:
```typescript
{
  name: string;
  subject: string;
  body: string;          // HTML content
  variables?: string[];  // Array de nombres de variables
}
```

**PUT** `/api/admin/marketing/email-templates/{id}`
- Actualizar plantilla

**DELETE** `/api/admin/marketing/email-templates/{id}`
- Eliminar plantilla

#### Automations

**GET** `/api/admin/marketing/automations`
- Obtener todas las automatizaciones (paginado)
- Query params: `page`, `size`, `sort`, `status`, `trigger`

**GET** `/api/admin/marketing/automations/{id}`
- Obtener automatización por ID

**POST** `/api/admin/marketing/automations`
- Crear nueva automatización
- Body:
```typescript
{
  name: string;
  trigger: "CONTACT_CREATED" | "OPPORTUNITY_STAGE_CHANGED" | "INVOICE_PAID" | "CUSTOM_EVENT";
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  conditions?: string;    // JSON string con condiciones
  actions?: string;      // JSON string con acciones
}
```

**PUT** `/api/admin/marketing/automations/{id}`
- Actualizar automatización

**PUT** `/api/admin/marketing/automations/{id}/status`
- Actualizar estado de automatización
- Query params: `status`

**DELETE** `/api/admin/marketing/automations/{id}`
- Eliminar automatización

---

## 4. Analytics (Sales Forecasting, Reports) ✅

### Base Path: `/api/admin/sales`

**GET** `/api/admin/sales/forecasting`
- Obtener datos de forecasting de ventas
- Query params: `period` (default: "MONTH"), `startDate`, `endDate`
- Ejemplo:
```typescript
axios.get('/api/admin/sales/forecasting', {
  params: {
    period: 'MONTH',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
})
```

**GET** `/api/admin/sales/metrics`
- Obtener métricas de ventas
- Retorna: total de oportunidades, valor total, conversión, etc.

**GET** `/api/admin/sales/opportunities/pipeline`
- Obtener vista de pipeline agrupada por etapa
- Retorna: Map<OpportunityStage, List<OpportunityResponse>>

---

## 5. Inventario (Inventory) ✅

### Base Path: `/api/admin/inventory`

#### Products

**GET** `/api/admin/inventory/products`
- Obtener todos los productos (paginado)
- Query params: `page`, `size`, `sort`, `type`, `category`, `search`

**GET** `/api/admin/inventory/products/{id}`
- Obtener producto por ID

**GET** `/api/admin/inventory/products/sku/{sku}`
- Obtener producto por SKU

**POST** `/api/admin/inventory/products`
- Crear nuevo producto
- Body:
```typescript
{
  name: string;
  sku: string;
  description?: string;
  type: "PRODUCT" | "SERVICE" | "DIGITAL";
  category?: string;
  price: number;
  cost?: number;
  images?: string[];      // Array de URLs
  variants?: Array<{
    name: string;
    sku: string;
    price: number;
    cost?: number;
  }>;
}
```

**PUT** `/api/admin/inventory/products/{id}`
- Actualizar producto

**DELETE** `/api/admin/inventory/products/{id}`
- Eliminar producto
- Query params: `hard=true` para eliminación permanente

#### Stock

**GET** `/api/admin/inventory/stock/{productId}`
- Obtener información de stock para un producto

**GET** `/api/admin/inventory/stock/low-stock`
- Obtener productos con stock bajo
- Retorna: List<StockResponse>

#### Stock Movements

**GET** `/api/admin/inventory/movements`
- Obtener todos los movimientos de stock (paginado)
- Query params: `page`, `size`, `sort`, `productId`

**POST** `/api/admin/inventory/movements`
- Crear nuevo movimiento de stock
- Body:
```typescript
{
  stockId: string;       // UUID
  type: "IN" | "OUT" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  reason?: string;
  reference?: string;
}
```

**DELETE** `/api/admin/inventory/movements/{id}`
- Eliminar movimiento de stock
- Query params: `hard=true` para eliminación permanente

---

## 6. Proveedores (Procurement) ✅

### Base Path: `/api/admin/procurement`

#### Vendors

**GET** `/api/admin/procurement/vendors`
- Obtener todos los proveedores (paginado)
- Query params: `page`, `size`, `sort`

**GET** `/api/admin/procurement/vendors/{id}`
- Obtener proveedor por ID

**POST** `/api/admin/procurement/vendors`
- Crear nuevo proveedor
- Body:
```typescript
{
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
}
```

**DELETE** `/api/admin/procurement/vendors/{id}`
- Eliminar proveedor
- Query params: `hard=true` para eliminación permanente

#### Purchase Orders

**GET** `/api/admin/procurement/purchase-orders`
- Obtener todas las órdenes de compra (paginado)
- Query params: `page`, `size`, `sort`, `status`, `vendorId`

**GET** `/api/admin/procurement/purchase-orders/{id}`
- Obtener orden de compra por ID

**POST** `/api/admin/procurement/purchase-orders`
- Crear nueva orden de compra
- Body:
```typescript
{
  vendorId: string;      // UUID
  orderDate: string;      // ISO date
  expectedDeliveryDate?: string;  // ISO date
  items: Array<{
    productId: string;    // UUID
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  notes?: string;
}
```

**POST** `/api/admin/procurement/purchase-orders/{id}/receive`
- Recibir productos de orden de compra
- Body:
```typescript
{
  "item-uuid-1": 10,     // Map<UUID, Integer> - cantidad recibida por item
  "item-uuid-2": 5
}
```

**PUT** `/api/admin/procurement/purchase-orders/{id}/status`
- Actualizar estado de orden de compra
- Query params: `status` ("DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "RECEIVED" | "CANCELLED")

**DELETE** `/api/admin/procurement/purchase-orders/{id}`
- Eliminar orden de compra
- Query params: `hard=true` para eliminación permanente

---

## 7. RRHH (HR) ✅

### Base Path: `/api/admin/hr`

#### Employees

**GET** `/api/admin/hr/employees`
- Obtener todos los empleados (paginado)
- Query params: `page`, `size`, `sort`

**GET** `/api/admin/hr/employees/{id}`
- Obtener empleado por ID

**POST** `/api/admin/hr/employees`
- Crear nuevo empleado
- Body:
```typescript
{
  userId: string;         // UUID - referencia a User
  employeeNumber: string;
  department?: string;
  position?: string;
  hireDate: string;       // ISO date
  salary?: number;
  status?: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
}
```

**DELETE** `/api/admin/hr/employees/{id}`
- Eliminar empleado
- Query params: `hard=true` para eliminación permanente

#### Attendance

**GET** `/api/admin/hr/attendance`
- Obtener todos los registros de asistencia (paginado)
- Query params: `page`, `size`, `sort`, `employeeId`

**GET** `/api/admin/hr/attendance/{id}`
- Obtener registro de asistencia por ID

**POST** `/api/admin/hr/attendance`
- Crear registro de asistencia
- Body:
```typescript
{
  employeeId: string;     // UUID
  date: string;           // ISO date
  checkIn?: string;       // ISO datetime
  checkOut?: string;      // ISO datetime
  status: "PRESENT" | "ABSENT" | "LATE" | "ON_LEAVE";
  notes?: string;
}
```

**POST** `/api/admin/hr/attendance/{employeeId}/check-in`
- Registrar entrada de empleado

**POST** `/api/admin/hr/attendance/{employeeId}/check-out`
- Registrar salida de empleado

#### Payroll

**GET** `/api/admin/hr/payroll`
- Obtener todas las nóminas (paginado)
- Query params: `page`, `size`, `sort`, `employeeId`, `status`

**GET** `/api/admin/hr/payroll/{id}`
- Obtener nómina por ID

**POST** `/api/admin/hr/payroll`
- Crear nómina
- Body:
```typescript
{
  employeeId: string;     // UUID
  periodStart: string;    // ISO date
  periodEnd: string;      // ISO date
  items: Array<{
    type: "EARNING" | "DEDUCTION" | "BONUS";
    description: string;
    amount: number;
  }>;
}
```

**PUT** `/api/admin/hr/payroll/{id}/approve`
- Aprobar nómina

**DELETE** `/api/admin/hr/payroll/{id}`
- Eliminar nómina
- Query params: `hard=true` para eliminación permanente

---

## 8. Proyectos (Projects) ✅

### Base Path: `/api/admin/projects`

#### Projects

**GET** `/api/admin/projects`
- Obtener todos los proyectos (paginado)
- Query params: `page`, `size`, `sort`, `status`, `managerId`

**GET** `/api/admin/projects/{id}`
- Obtener proyecto por ID

**POST** `/api/admin/projects`
- Crear nuevo proyecto
- Body:
```typescript
{
  name: string;
  description?: string;
  managerId: string;      // UUID
  startDate?: string;     // ISO date
  endDate?: string;       // ISO date
  budget?: number;
  status?: "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
}
```

**PUT** `/api/admin/projects/{id}/status`
- Actualizar estado de proyecto
- Query params: `status`

**DELETE** `/api/admin/projects/{id}`
- Eliminar proyecto
- Query params: `hard=true` para eliminación permanente

#### Time Entries

**GET** `/api/admin/projects/time-entries`
- Obtener todas las entradas de tiempo (paginado)
- Query params: `page`, `size`, `sort`, `projectId`, `userId`, `startDate`, `endDate`

**GET** `/api/admin/projects/{id}/time-entries`
- Obtener entradas de tiempo de un proyecto específico

**GET** `/api/admin/projects/time-entries/{id}`
- Obtener entrada de tiempo por ID

**POST** `/api/admin/projects/time-entries`
- Crear nueva entrada de tiempo
- Body:
```typescript
{
  projectId: string;      // UUID
  taskId?: string;        // UUID - referencia a Task existente
  date: string;           // ISO date
  hours: number;
  description?: string;
  status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
}
```

**DELETE** `/api/admin/projects/time-entries/{id}`
- Eliminar entrada de tiempo
- Query params: `hard=true` para eliminación permanente

---

## 9. Reportes (Financial Reports) ✅

Ver sección **1. Facturas (Finance)** - Subsección **Financial Reports**

---

## 10. Workflows ⚠️

### Base Path: `/api/admin/workflows` (Sugerido - Falta implementar controlador)

**GET** `/api/admin/workflows`
- Obtener todos los workflows (paginado)
- Query params: `page`, `size`, `sort`, `status`, `triggerEvent`

**GET** `/api/admin/workflows/{id}`
- Obtener workflow por ID (incluye steps)

**POST** `/api/admin/workflows`
- Crear nuevo workflow
- Body:
```typescript
{
  name: string;
  description?: string;
  triggerEvent: string;   // Ejemplo: "invoice.created", "opportunity.stage_changed"
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  steps: Array<{
    name: string;
    order: number;
    actionType: string;   // Ejemplo: "send_email", "create_task"
    actionConfig?: string; // JSON string con configuración
    conditions?: string;   // JSON string con condiciones
  }>;
}
```

**PUT** `/api/admin/workflows/{id}`
- Actualizar workflow

**PUT** `/api/admin/workflows/{id}/status`
- Actualizar estado de workflow
- Query params: `status`

**POST** `/api/admin/workflows/{id}/execute`
- Ejecutar workflow manualmente
- Body:
```typescript
{
  entityType: string;
  entityId: string;       // UUID
  context?: object;       // Contexto adicional para la ejecución
}
```

**DELETE** `/api/admin/workflows/{id}`
- Eliminar workflow
- Query params: `hard=true` para eliminación permanente

---

## 11. Documentos (Documents) ⚠️

### Base Path: `/api/admin/documents` (Sugerido - Falta implementar controlador)

**GET** `/api/admin/documents`
- Obtener todos los documentos (paginado)
- Query params: `page`, `size`, `sort`, `entityType`, `entityId`, `type`

**GET** `/api/admin/documents/{id}`
- Obtener documento por ID

**POST** `/api/admin/documents`
- Crear nuevo documento (upload)
- Body: FormData
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('name', 'document-name.pdf');
formData.append('type', 'CONTRACT');
formData.append('entityType', 'Invoice');
formData.append('entityId', 'uuid-here');

axios.post('/api/admin/documents', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

**GET** `/api/admin/documents/{id}/download`
- Descargar documento

**DELETE** `/api/admin/documents/{id}`
- Eliminar documento
- Query params: `hard=true` para eliminación permanente

---

## 12. Integraciones (API Keys) ⚠️

### Base Path: `/api/admin/integrations` (Sugerido - Falta implementar controlador)

#### API Keys

**GET** `/api/admin/integrations/api-keys`
- Obtener todas las API keys (paginado)
- Query params: `page`, `size`, `sort`, `status`

**GET** `/api/admin/integrations/api-keys/{id}`
- Obtener API key por ID

**POST** `/api/admin/integrations/api-keys`
- Crear nueva API key
- Body:
```typescript
{
  name: string;
  permissions: string[];  // Array de permisos, ej: ["read:invoices", "write:contacts"]
  expiresAt?: string;     // ISO datetime
}
```
- Response incluye el `key` generado (solo se muestra una vez)

**PUT** `/api/admin/integrations/api-keys/{id}/revoke`
- Revocar API key
- Cambia status a "REVOKED"

**PUT** `/api/admin/integrations/api-keys/{id}/status`
- Actualizar estado de API key
- Query params: `status` ("ACTIVE" | "INACTIVE" | "REVOKED")

**DELETE** `/api/admin/integrations/api-keys/{id}`
- Eliminar API key
- Query params: `hard=true` para eliminación permanente

#### System Settings

**GET** `/api/admin/integrations/settings`
- Obtener todas las configuraciones del sistema
- Query params: `type` (opcional)

**GET** `/api/admin/integrations/settings/{key}`
- Obtener configuración por key

**PUT** `/api/admin/integrations/settings/{key}`
- Actualizar configuración
- Body:
```typescript
{
  value: string;
  description?: string;
}
```

---

## 13. Ventas (Sales) ✅

### Base Path: `/api/admin/sales`

#### Opportunities

**GET** `/api/admin/sales/opportunities`
- Obtener todas las oportunidades (paginado)
- Query params: `page`, `size`, `sort`, `stage`, `assignedToId`

**GET** `/api/admin/sales/opportunities/{id}`
- Obtener oportunidad por ID

**POST** `/api/admin/sales/opportunities`
- Crear nueva oportunidad
- Body:
```typescript
{
  name: string;
  amount: number;
  stage: "PROSPECTING" | "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";
  probability?: number;   // 0-100
  expectedCloseDate?: string;  // ISO date
  assignedToId?: string;  // UUID
  contactId?: string;     // UUID
  companyId?: string;     // UUID
  description?: string;
}
```

**PUT** `/api/admin/sales/opportunities/{id}`
- Actualizar oportunidad

**PUT** `/api/admin/sales/opportunities/{id}/stage`
- Actualizar etapa de oportunidad
- Query params: `stage`

**DELETE** `/api/admin/sales/opportunities/{id}`
- Eliminar oportunidad
- Query params: `hard=true` para eliminación permanente

#### Leads

**GET** `/api/admin/sales/leads`
- Obtener todos los leads (paginado)
- Query params: `page`, `size`, `sort`, `status`, `assignedToId`

**GET** `/api/admin/sales/leads/{id}`
- Obtener lead por ID

**POST** `/api/admin/sales/leads`
- Crear nuevo lead
- Body:
```typescript
{
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "EMAIL" | "PHONE" | "OTHER";
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
  score?: number;         // 0-100
  assignedToId?: string; // UUID
  notes?: string;
}
```

**PUT** `/api/admin/sales/leads/{id}`
- Actualizar lead

**PUT** `/api/admin/sales/leads/{id}/score`
- Actualizar score de lead
- Query params: `score` (0-100)

**POST** `/api/admin/sales/leads/{id}/convert`
- Convertir lead a oportunidad

**DELETE** `/api/admin/sales/leads/{id}`
- Eliminar lead
- Query params: `hard=true` para eliminación permanente

#### Activities

**GET** `/api/admin/sales/activities`
- Obtener todas las actividades (paginado)
- Query params: `page`, `size`, `sort`

**GET** `/api/admin/sales/activities/{id}`
- Obtener actividad por ID

**GET** `/api/admin/sales/activities/opportunity/{opportunityId}`
- Obtener actividades de una oportunidad

**GET** `/api/admin/sales/activities/lead/{leadId}`
- Obtener actividades de un lead

**POST** `/api/admin/sales/activities`
- Crear nueva actividad
- Body:
```typescript
{
  type: "CALL" | "EMAIL" | "MEETING" | "NOTE" | "TASK" | "OTHER";
  subject: string;
  description?: string;
  dueDate?: string;      // ISO datetime
  opportunityId?: string; // UUID
  leadId?: string;       // UUID
  completed?: boolean;
}
```

**PUT** `/api/admin/sales/activities/{id}`
- Actualizar actividad

**PUT** `/api/admin/sales/activities/{id}/complete`
- Marcar actividad como completada

**DELETE** `/api/admin/sales/activities/{id}`
- Eliminar actividad
- Query params: `hard=true` para eliminación permanente

---

## 14. Contactos (Contacts) ✅

### Base Path: `/api/admin/contacts`

#### Contacts

**GET** `/api/admin/contacts`
- Obtener todos los contactos (paginado)
- Query params: `page`, `size`, `sort`, `companyId`

**GET** `/api/admin/contacts/{id}`
- Obtener contacto por ID

**POST** `/api/admin/contacts`
- Crear nuevo contacto
- Body:
```typescript
{
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type: "PERSON" | "COMPANY";
  companyId?: string;    // UUID
  tags?: string[];       // Array de tag names
  notes?: string;
}
```

**PUT** `/api/admin/contacts/{id}`
- Actualizar contacto

**DELETE** `/api/admin/contacts/{id}`
- Eliminar contacto
- Query params: `hard=true` para eliminación permanente

#### Companies

**GET** `/api/admin/contacts/companies`
- Obtener todas las empresas (paginado)
- Query params: `page`, `size`, `sort`

**GET** `/api/admin/contacts/companies/{id}`
- Obtener empresa por ID

**POST** `/api/admin/contacts/companies`
- Crear nueva empresa
- Body:
```typescript
{
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: "TECHNOLOGY" | "FINANCE" | "HEALTHCARE" | "RETAIL" | "MANUFACTURING" | "OTHER";
  size?: "STARTUP" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
  taxId?: string;
  notes?: string;
}
```

**PUT** `/api/admin/contacts/companies/{id}`
- Actualizar empresa

**DELETE** `/api/admin/contacts/companies/{id}`
- Eliminar empresa
- Query params: `hard=true` para eliminación permanente

---

## 15. Admin (Administración) ✅

### Base Path: `/api/admin`

Ver controlador completo `AdminController.java` para todas las rutas de administración:
- Users: `/api/admin/users`
- Groups: `/api/admin/groups`
- Expenses: `/api/admin/expenses`
- Budgets: `/api/admin/budgets`
- Categories: `/api/admin/categories`
- Conversations: `/api/admin/conversations`
- Messages: `/api/admin/messages`
- Settlements: `/api/admin/settlements`
- Subscriptions: `/api/admin/subscriptions`
- Support Tickets: `/api/admin/support-tickets`
- Group Invitations: `/api/admin/group-invitations` ⚠️ **Requiere rol ADMIN/SUPER_ADMIN**
- Group Users: `/api/admin/group-users`
- Plans: `/api/admin/plans`
- Tasks: `/api/admin/tasks`
- Task Tags: `/api/admin/task-tags`

Todas siguen el patrón CRUD estándar:
- `GET /resource` - Listar (paginado)
- `GET /resource/{id}` - Obtener por ID
- `POST /resource` - Crear
- `PUT /resource/{id}` - Actualizar
- `DELETE /resource/{id}` - Eliminar (soft delete por defecto, `?hard=true` para permanente)

#### Notas Importantes sobre Permisos:

**Group Invitations (`/api/admin/group-invitations`)**:
- ⚠️ **Crear invitaciones grupales requiere rol ADMIN o SUPER_ADMIN del sistema**
- El endpoint público `/groups/{groupId}/invitations/targeted` está deprecated y requiere permisos admin
- Solo los administradores del sistema pueden crear invitaciones, no solo los admins del grupo
- Usar `adminApi.createGroupInvitation()` en lugar de `groupInvitationsApi.createTargeted()`

---

## Ejemplos de Uso con Axios

### Configuración Base

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Ejemplo: Obtener Facturas con Filtros

```typescript
const getInvoices = async (filters: {
  page?: number;
  size?: number;
  status?: string;
  contactId?: string;
}) => {
  try {
    const response = await apiClient.get('/admin/finance/invoices', {
      params: filters
    });
    return response.data.data; // ApiResponse<Page<InvoiceResponse>>
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};
```

### Ejemplo: Crear Factura

```typescript
const createInvoice = async (invoiceData: {
  issueDate: string;
  dueDate: string;
  subtotal: number;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) => {
  try {
    const response = await apiClient.post('/admin/finance/invoices', invoiceData);
    return response.data.data; // InvoiceResponse
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};
```

### Ejemplo: Paginación

```typescript
const getPaginatedData = async (
  endpoint: string,
  page: number = 0,
  size: number = 20,
  sort: string = 'createdAt,desc'
) => {
  const response = await apiClient.get(endpoint, {
    params: { page, size, sort }
  });
  return response.data.data; // Page<T>
};
```

---

## Notas Importantes

1. **Soft Delete**: Por defecto, todos los `DELETE` realizan soft delete. Usa `?hard=true` para eliminación permanente.

2. **Paginación**: Todos los endpoints de listado soportan paginación con `page`, `size`, y `sort`.

3. **Fechas**: Todas las fechas deben estar en formato ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`).

4. **UUIDs**: Todos los IDs son UUIDs (strings).

5. **Autenticación**: Todas las rutas requieren token JWT en el header `Authorization`.

6. **Módulos Pendientes**: Los módulos marcados con ⚠️ tienen modelos y repositorios pero faltan controladores. Las rutas sugeridas están basadas en la estructura de los modelos existentes.

7. **WebSocket**: Para notificaciones en tiempo real, ver documentación en `crm-erp-backend-implementation.plan.md`.

---

## Estado de Implementación

- ✅ **Completamente Implementado**: Finance, Inventory, Procurement, HR, Projects, Sales, Contacts, Admin
- ⚠️ **Parcialmente Implementado**: Analytics (solo forecasting en Sales)
- ❌ **Pendiente de Implementar**: Audit, Marketing, Workflows, Documents, Integrations (API Keys, Settings)

