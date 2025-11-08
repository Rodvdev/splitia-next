# Splitia CRM/ERP - Backend API Documentation

## Documentación Completa de Interfaces y Rutas para Frontend

Este documento contiene todas las rutas REST API y la configuración de WebSocket para conectar exitosamente el frontend Next.js con el backend Spring Boot.

---

## Tabla de Contenidos

1. [Configuración Base](#configuración-base)
2. [Autenticación](#autenticación)
3. [CRM - Sales (Ventas)](#crm---sales-ventas)
4. [CRM - Contacts (Contactos)](#crm---contacts-contactos)
5. [ERP - Finance (Finanzas)](#erp---finance-finanzas)
6. [ERP - Inventory (Inventario)](#erp---inventory-inventario)
7. [ERP - Procurement (Proveedores)](#erp---procurement-proveedores)
8. [HR (Recursos Humanos)](#hr-recursos-humanos)
9. [Projects (Proyectos)](#projects-proyectos)
10. [WebSocket Configuration](#websocket-configuration)
11. [WebSocket Events](#websocket-events)

---

## Configuración Base

### Base URL
```
http://localhost:8080/api
```

### Headers Requeridos
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {JWT_TOKEN}"
}
```

### Formato de Respuesta Estándar
Todas las respuestas siguen el formato `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string; // ISO 8601 format
}
```

### Paginación
Todos los endpoints de listado usan paginación Spring Boot:

**Query Parameters:**
- `page`: número de página (0-indexed, default: 0)
- `size`: tamaño de página (default: 20)
- `sort`: campo de ordenamiento (ej: `name,asc` o `createdAt,desc`)

**Respuesta Paginada:**
```typescript
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

---

## Autenticación

### Base Path: `/api/auth`

#### POST `/api/auth/login`
Iniciar sesión

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ADMIN"
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00"
}
```

#### POST `/api/auth/register`
Registrar nuevo usuario

#### POST `/api/auth/refresh`
Refrescar token JWT

---

## CRM - Sales (Ventas)

### Base Path: `/api/admin/sales`

### Enums

```typescript
enum OpportunityStage {
  LEAD = "LEAD",
  QUALIFIED = "QUALIFIED",
  PROPOSAL = "PROPOSAL",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST"
}

enum LeadSource {
  WEB = "WEB",
  REFERRAL = "REFERRAL",
  EVENT = "EVENT",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  OTHER = "OTHER"
}

enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  CONVERTED = "CONVERTED",
  LOST = "LOST"
}

enum ActivityType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  MEETING = "MEETING",
  NOTE = "NOTE"
}
```

### Opportunities

#### GET `/api/admin/sales/opportunities`
Obtener todas las oportunidades con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `stage`: `OpportunityStage` (opcional)
- `assignedToId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Enterprise Deal",
        "description": "Large enterprise opportunity",
        "estimatedValue": 50000.00,
        "probability": 75,
        "stage": "NEGOTIATION",
        "expectedCloseDate": "2024-03-15",
        "actualCloseDate": null,
        "wonAmount": null,
        "lostReason": null,
        "currency": "USD",
        "assignedToId": "uuid",
        "assignedToName": "John Doe",
        "contactId": "uuid",
        "contactName": "Jane Smith",
        "companyId": "uuid",
        "companyName": "Acme Corp",
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "size": 20,
    "number": 0
  }
}
```

#### GET `/api/admin/sales/opportunities/{id}`
Obtener oportunidad por ID

#### POST `/api/admin/sales/opportunities`
Crear nueva oportunidad

**Request:**
```json
{
  "name": "Enterprise Deal",
  "description": "Large enterprise opportunity",
  "estimatedValue": 50000.00,
  "probability": 75,
  "stage": "LEAD",
  "expectedCloseDate": "2024-03-15",
  "assignedToId": "uuid",
  "contactId": "uuid",
  "companyId": "uuid",
  "currency": "USD"
}
```

#### PUT `/api/admin/sales/opportunities/{id}`
Actualizar oportunidad

**Request:** Similar a CreateOpportunityRequest (todos los campos opcionales)

#### PUT `/api/admin/sales/opportunities/{id}/stage`
Actualizar etapa de oportunidad

**Query Parameters:**
- `stage`: `OpportunityStage`

#### DELETE `/api/admin/sales/opportunities/{id}`
Eliminar oportunidad

**Query Parameters:**
- `hard`: `boolean` (default: false) - true para eliminación permanente

#### GET `/api/admin/sales/opportunities/pipeline`
Obtener vista de pipeline agrupada por etapa

**Response:**
```json
{
  "success": true,
  "data": {
    "LEAD": [...],
    "QUALIFIED": [...],
    "PROPOSAL": [...],
    "NEGOTIATION": [...],
    "CLOSED_WON": [...],
    "CLOSED_LOST": [...]
  }
}
```

### Leads

#### GET `/api/admin/sales/leads`
Obtener todos los leads con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `status`: `LeadStatus` (opcional)
- `assignedToId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "John Lead",
        "email": "lead@example.com",
        "phone": "+1234567890",
        "company": "Lead Company",
        "source": "WEB",
        "status": "NEW",
        "score": 65,
        "assignedToId": "uuid",
        "assignedToName": "Sales Rep",
        "contactId": "uuid",
        "contactName": "John Lead",
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/sales/leads/{id}`
Obtener lead por ID

#### POST `/api/admin/sales/leads`
Crear nuevo lead

**Request:**
```json
{
  "name": "John Lead",
  "email": "lead@example.com",
  "phone": "+1234567890",
  "company": "Lead Company",
  "source": "WEB",
  "status": "NEW",
  "score": 65,
  "assignedToId": "uuid",
  "contactId": "uuid"
}
```

#### PUT `/api/admin/sales/leads/{id}`
Actualizar lead

#### PUT `/api/admin/sales/leads/{id}/score`
Actualizar score del lead

**Query Parameters:**
- `score`: `number` (0-100)

#### POST `/api/admin/sales/leads/{id}/convert`
Convertir lead a oportunidad

**Response:** `OpportunityResponse`

#### DELETE `/api/admin/sales/leads/{id}`
Eliminar lead

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Activities

#### GET `/api/admin/sales/activities`
Obtener todas las actividades

**Query Parameters:**
- `page`, `size`, `sort`: Paginación

#### GET `/api/admin/sales/activities/{id}`
Obtener actividad por ID

#### GET `/api/admin/sales/activities/opportunity/{opportunityId}`
Obtener actividades de una oportunidad

**Response:** `List<ActivityResponse>`

#### GET `/api/admin/sales/activities/lead/{leadId}`
Obtener actividades de un lead

**Response:** `List<ActivityResponse>`

#### POST `/api/admin/sales/activities`
Crear nueva actividad

**Request:**
```json
{
  "type": "CALL",
  "subject": "Follow-up call",
  "description": "Discuss proposal details",
  "dueDate": "2024-01-20",
  "opportunityId": "uuid",
  "leadId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "CALL",
  "subject": "Follow-up call",
  "description": "Discuss proposal details",
  "dueDate": "2024-01-20",
  "completed": false,
  "completedAt": null,
  "opportunityId": "uuid",
  "leadId": "uuid",
  "createdById": "uuid",
  "createdByName": "John Doe",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

#### PUT `/api/admin/sales/activities/{id}`
Actualizar actividad

#### PUT `/api/admin/sales/activities/{id}/complete`
Marcar actividad como completada

#### DELETE `/api/admin/sales/activities/{id}`
Eliminar actividad

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Forecasting and Metrics

#### GET `/api/admin/sales/forecasting`
Obtener datos de forecasting

**Query Parameters:**
- `period`: `string` (default: "MONTH") - MONTH, QUARTER, YEAR
- `startDate`: `string` (ISO date, opcional)
- `endDate`: `string` (ISO date, opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "MONTH",
    "forecastedRevenue": 150000.00,
    "weightedForecast": 112500.00,
    "byStage": {
      "LEAD": 20000.00,
      "QUALIFIED": 30000.00,
      "PROPOSAL": 40000.00,
      "NEGOTIATION": 60000.00
    }
  }
}
```

#### GET `/api/admin/sales/metrics`
Obtener métricas de ventas

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOpportunities": 50,
    "totalValue": 500000.00,
    "winRate": 0.35,
    "averageDealSize": 10000.00,
    "averageSalesCycle": 45
  }
}
```

---

## CRM - Contacts (Contactos)

### Base Path: `/api/admin/contacts`

### Enums

```typescript
enum ContactType {
  CUSTOMER = "CUSTOMER",
  PROSPECT = "PROSPECT",
  PARTNER = "PARTNER",
  VENDOR = "VENDOR"
}

enum CompanySize {
  STARTUP = "STARTUP",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  ENTERPRISE = "ENTERPRISE"
}

enum Industry {
  TECHNOLOGY = "TECHNOLOGY",
  FINANCE = "FINANCE",
  HEALTHCARE = "HEALTHCARE",
  RETAIL = "RETAIL",
  MANUFACTURING = "MANUFACTURING",
  CONSULTING = "CONSULTING",
  EDUCATION = "EDUCATION",
  REAL_ESTATE = "REAL_ESTATE",
  OTHER = "OTHER"
}
```

### Contacts

#### GET `/api/admin/contacts`
Obtener todos los contactos

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `companyId`: `UUID` (opcional) - Filtrar por empresa

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "mobile": "+1234567891",
        "jobTitle": "CEO",
        "department": "Executive",
        "type": "CUSTOMER",
        "companyId": "uuid",
        "companyName": "Acme Corp",
        "ownerId": "uuid",
        "ownerName": "Sales Rep",
        "tags": [
          {
            "id": "uuid",
            "name": "VIP",
            "color": "#FF5733"
          }
        ],
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/contacts/{id}`
Obtener contacto por ID

#### POST `/api/admin/contacts`
Crear nuevo contacto

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "mobile": "+1234567891",
  "jobTitle": "CEO",
  "department": "Executive",
  "type": "CUSTOMER",
  "companyId": "uuid",
  "ownerId": "uuid",
  "tagIds": ["uuid1", "uuid2"]
}
```

#### PUT `/api/admin/contacts/{id}`
Actualizar contacto

#### DELETE `/api/admin/contacts/{id}`
Eliminar contacto

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Companies

#### GET `/api/admin/contacts/companies`
Obtener todas las empresas

**Query Parameters:**
- `page`, `size`, `sort`: Paginación

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Acme Corp",
        "website": "https://acme.com",
        "email": "info@acme.com",
        "phone": "+1234567890",
        "industry": "TECHNOLOGY",
        "size": "MEDIUM",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "postalCode": "10001",
        "ownerId": "uuid",
        "ownerName": "Sales Rep",
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/contacts/companies/{id}`
Obtener empresa por ID

#### POST `/api/admin/contacts/companies`
Crear nueva empresa

**Request:**
```json
{
  "name": "Acme Corp",
  "website": "https://acme.com",
  "email": "info@acme.com",
  "phone": "+1234567890",
  "industry": "TECHNOLOGY",
  "size": "MEDIUM",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "postalCode": "10001",
  "ownerId": "uuid"
}
```

#### PUT `/api/admin/contacts/companies/{id}`
Actualizar empresa

#### DELETE `/api/admin/contacts/companies/{id}`
Eliminar empresa

**Query Parameters:**
- `hard`: `boolean` (default: false)

---

## ERP - Finance (Finanzas)

### Base Path: `/api/admin/finance`

### Enums

```typescript
enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  VOID = "VOID"
}

enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  PAYPAL = "PAYPAL",
  OTHER = "OTHER"
}
```

### Invoices

#### GET `/api/admin/finance/invoices`
Obtener todas las facturas con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `status`: `InvoiceStatus` (opcional)
- `contactId`: `UUID` (opcional)
- `companyId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "invoiceNumber": "INV-2024-000001",
        "issueDate": "2024-01-15",
        "dueDate": "2024-02-15",
        "status": "SENT",
        "subtotal": 1000.00,
        "tax": 100.00,
        "total": 1100.00,
        "currency": "USD",
        "notes": "Payment terms: Net 30",
        "contactId": "uuid",
        "contactName": "John Doe",
        "companyId": "uuid",
        "companyName": "Acme Corp",
        "createdById": "uuid",
        "createdByName": "Admin User",
        "items": [
          {
            "id": "uuid",
            "description": "Product A",
            "quantity": 2,
            "unitPrice": 500.00,
            "total": 1000.00
          }
        ],
        "paidAmount": 0.00,
        "remainingAmount": 1100.00,
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/finance/invoices/{id}`
Obtener factura por ID

#### POST `/api/admin/finance/invoices`
Crear nueva factura

**Request:**
```json
{
  "invoiceNumber": "INV-2024-000001",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "status": "DRAFT",
  "subtotal": 1000.00,
  "tax": 100.00,
  "total": 1100.00,
  "currency": "USD",
  "notes": "Payment terms: Net 30",
  "contactId": "uuid",
  "companyId": "uuid",
  "items": [
    {
      "description": "Product A",
      "quantity": 2,
      "unitPrice": 500.00,
      "total": 1000.00
    }
  ]
}
```

**Nota:** `invoiceNumber` es opcional - se genera automáticamente si no se proporciona.

#### PUT `/api/admin/finance/invoices/{id}`
Actualizar factura

#### POST `/api/admin/finance/invoices/{id}/payments`
Agregar pago a factura

**Request:**
```json
{
  "amount": 500.00,
  "date": "2024-01-20",
  "method": "BANK_TRANSFER",
  "reference": "TXN-12345",
  "notes": "Partial payment"
}
```

**Response:** `PaymentResponse`

#### DELETE `/api/admin/finance/invoices/{id}`
Eliminar factura

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Payments

#### GET `/api/admin/finance/payments`
Obtener todos los pagos

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `invoiceId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "invoiceId": "uuid",
        "invoiceNumber": "INV-2024-000001",
        "amount": 500.00,
        "date": "2024-01-20",
        "method": "BANK_TRANSFER",
        "reference": "TXN-12345",
        "notes": "Partial payment",
        "isReconciled": false,
        "createdAt": "2024-01-20T10:00:00",
        "updatedAt": "2024-01-20T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/finance/payments/{id}`
Obtener pago por ID

#### POST `/api/admin/finance/payments`
Crear nuevo pago

**Request:**
```json
{
  "invoiceId": "uuid",
  "amount": 500.00,
  "date": "2024-01-20",
  "method": "BANK_TRANSFER",
  "reference": "TXN-12345",
  "notes": "Partial payment"
}
```

#### PUT `/api/admin/finance/payments/{id}/reconcile`
Conciliar pago

**Query Parameters:**
- `isReconciled`: `boolean` (default: true)

#### DELETE `/api/admin/finance/payments/{id}`
Eliminar pago

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Financial Reports

#### GET `/api/admin/finance/reports/balance-sheet`
Obtener balance general

**Query Parameters:**
- `asOfDate`: `string` (ISO date, opcional) - Fecha de corte

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2024-01-31",
    "assets": 500000.00,
    "liabilities": 200000.00,
    "equity": 300000.00,
    "totalLiabilitiesAndEquity": 500000.00
  }
}
```

#### GET `/api/admin/finance/reports/income-statement`
Obtener estado de resultados

**Query Parameters:**
- `startDate`: `string` (ISO date, opcional)
- `endDate`: `string` (ISO date, opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "revenue": 100000.00,
    "expenses": 60000.00,
    "netIncome": 40000.00
  }
}
```

#### GET `/api/admin/finance/reports/cash-flow`
Obtener flujo de efectivo

**Query Parameters:**
- `startDate`: `string` (ISO date, opcional)
- `endDate`: `string` (ISO date, opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "cashFromOperations": 50000.00,
    "cashFromSales": 80000.00,
    "netCashFlow": 130000.00
  }
}
```

#### GET `/api/admin/finance/reports/profitability`
Análisis de rentabilidad

**Query Parameters:**
- `startDate`: `string` (ISO date, opcional)
- `endDate`: `string` (ISO date, opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "profitMargin": 40.0,
    "roi": 15.5,
    "revenueGrowth": 12.3
  }
}
```

---

## ERP - Inventory (Inventario)

### Base Path: `/api/admin/inventory`

### Enums

```typescript
enum ProductType {
  GOOD = "GOOD",
  SERVICE = "SERVICE"
}

enum StockMovementType {
  IN = "IN",
  OUT = "OUT",
  RETURN = "RETURN",
  ADJUSTMENT = "ADJUSTMENT"
}
```

### Products

#### GET `/api/admin/inventory/products`
Obtener todos los productos con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `type`: `ProductType` (opcional)
- `category`: `string` (opcional)
- `search`: `string` (opcional) - Búsqueda por nombre, SKU o descripción

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "sku": "PROD-001",
        "name": "Product A",
        "description": "High-quality product",
        "type": "GOOD",
        "price": 100.00,
        "cost": 60.00,
        "currency": "USD",
        "category": "Electronics",
        "images": ["https://example.com/image1.jpg"],
        "stock": {
          "id": "uuid",
          "productId": "uuid",
          "productName": "Product A",
          "productSku": "PROD-001",
          "quantity": 50,
          "minQuantity": 10,
          "maxQuantity": 100,
          "location": "Warehouse A",
          "isLowStock": false
        },
        "variants": [
          {
            "id": "uuid",
            "sku": "PROD-001-RED",
            "name": "Product A - Red",
            "price": 105.00,
            "cost": 62.00,
            "attributes": "{\"color\":\"red\",\"size\":\"M\"}"
          }
        ],
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/inventory/products/{id}`
Obtener producto por ID

#### GET `/api/admin/inventory/products/sku/{sku}`
Obtener producto por SKU

#### POST `/api/admin/inventory/products`
Crear nuevo producto

**Request:**
```json
{
  "sku": "PROD-001",
  "name": "Product A",
  "description": "High-quality product",
  "type": "GOOD",
  "price": 100.00,
  "cost": 60.00,
  "currency": "USD",
  "category": "Electronics",
  "images": ["https://example.com/image1.jpg"],
  "minQuantity": 10,
  "maxQuantity": 100,
  "location": "Warehouse A",
  "variants": [
    {
      "sku": "PROD-001-RED",
      "name": "Product A - Red",
      "price": 105.00,
      "cost": 62.00,
      "attributes": "{\"color\":\"red\",\"size\":\"M\"}"
    }
  ]
}
```

#### PUT `/api/admin/inventory/products/{id}`
Actualizar producto

#### DELETE `/api/admin/inventory/products/{id}`
Eliminar producto

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Stock

#### GET `/api/admin/inventory/stock/{productId}`
Obtener información de stock de un producto

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "productName": "Product A",
    "productSku": "PROD-001",
    "quantity": 50,
    "minQuantity": 10,
    "maxQuantity": 100,
    "location": "Warehouse A",
    "isLowStock": false
  }
}
```

#### GET `/api/admin/inventory/stock/low-stock`
Obtener productos con stock bajo

**Response:** `List<StockResponse>`

### Stock Movements

#### GET `/api/admin/inventory/movements`
Obtener todos los movimientos de stock

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `productId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "Product A",
        "productSku": "PROD-001",
        "type": "IN",
        "quantity": 100,
        "reason": "Purchase order receipt",
        "reference": "PO-2024-000001",
        "date": "2024-01-15",
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### POST `/api/admin/inventory/movements`
Crear nuevo movimiento de stock

**Request:**
```json
{
  "productId": "uuid",
  "type": "IN",
  "quantity": 100,
  "reason": "Purchase order receipt",
  "reference": "PO-2024-000001",
  "date": "2024-01-15"
}
```

#### DELETE `/api/admin/inventory/movements/{id}`
Eliminar movimiento de stock

**Query Parameters:**
- `hard`: `boolean` (default: false)

---

## ERP - Procurement (Proveedores)

### Base Path: `/api/admin/procurement`

### Enums

```typescript
enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  ORDERED = "ORDERED",
  RECEIVED = "RECEIVED",
  CANCELLED = "CANCELLED"
}

enum PaymentTerms {
  NET_15 = "NET_15",
  NET_30 = "NET_30",
  NET_45 = "NET_45",
  NET_60 = "NET_60",
  DUE_ON_RECEIPT = "DUE_ON_RECEIPT",
  PREPAID = "PREPAID"
}
```

### Vendors

#### GET `/api/admin/procurement/vendors`
Obtener todos los proveedores

**Query Parameters:**
- `page`, `size`, `sort`: Paginación

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Supplier Corp",
        "contactName": "Jane Supplier",
        "email": "contact@supplier.com",
        "phoneNumber": "+1234567890",
        "taxId": "TAX-123456",
        "address": "456 Supplier St",
        "city": "Los Angeles",
        "country": "USA",
        "paymentTerms": "NET_30",
        "rating": 4,
        "notes": "Reliable supplier",
        "createdById": "uuid",
        "createdByName": "Admin User",
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/procurement/vendors/{id}`
Obtener proveedor por ID

#### POST `/api/admin/procurement/vendors`
Crear nuevo proveedor

**Request:**
```json
{
  "name": "Supplier Corp",
  "contactName": "Jane Supplier",
  "email": "contact@supplier.com",
  "phoneNumber": "+1234567890",
  "taxId": "TAX-123456",
  "address": "456 Supplier St",
  "city": "Los Angeles",
  "country": "USA",
  "paymentTerms": "NET_30",
  "rating": 4,
  "notes": "Reliable supplier"
}
```

#### DELETE `/api/admin/procurement/vendors/{id}`
Eliminar proveedor

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Purchase Orders

#### GET `/api/admin/procurement/purchase-orders`
Obtener todas las órdenes de compra con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `status`: `PurchaseOrderStatus` (opcional)
- `vendorId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "orderNumber": "PO-2024-000001",
        "vendorId": "uuid",
        "vendorName": "Supplier Corp",
        "orderDate": "2024-01-15",
        "expectedDate": "2024-01-30",
        "status": "ORDERED",
        "total": 5000.00,
        "createdById": "uuid",
        "createdByName": "Admin User",
        "notes": "Urgent order",
        "items": [
          {
            "id": "uuid",
            "productId": "uuid",
            "productName": "Product A",
            "productSku": "PROD-001",
            "quantity": 50,
            "unitPrice": 100.00,
            "total": 5000.00,
            "receivedQuantity": 0
          }
        ],
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ]
  }
}
```

#### GET `/api/admin/procurement/purchase-orders/{id}`
Obtener orden de compra por ID

#### POST `/api/admin/procurement/purchase-orders`
Crear nueva orden de compra

**Request:**
```json
{
  "orderNumber": "PO-2024-000001",
  "vendorId": "uuid",
  "orderDate": "2024-01-15",
  "expectedDate": "2024-01-30",
  "status": "DRAFT",
  "notes": "Urgent order",
  "items": [
    {
      "productId": "uuid",
      "quantity": 50,
      "unitPrice": 100.00
    }
  ]
}
```

**Nota:** `orderNumber` es opcional - se genera automáticamente si no se proporciona (formato: PO-YYYY-NNNNNN).

#### POST `/api/admin/procurement/purchase-orders/{id}/receive`
Recibir productos de orden de compra

**Request:**
```json
{
  "uuid-of-item-1": 30,
  "uuid-of-item-2": 50
}
```

**Nota:** El objeto mapea `itemId` (UUID) a `quantity` recibida. Actualiza automáticamente el stock.

#### PUT `/api/admin/procurement/purchase-orders/{id}/status`
Actualizar estado de orden de compra

**Query Parameters:**
- `status`: `PurchaseOrderStatus`

#### DELETE `/api/admin/procurement/purchase-orders/{id}`
Eliminar orden de compra

**Query Parameters:**
- `hard`: `boolean` (default: false)

---

## HR (Recursos Humanos)

### Base Path: `/api/admin/hr`

### Enums

```typescript
enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  TERMINATED = "TERMINATED",
  ON_LEAVE = "ON_LEAVE"
}

enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  HALF_DAY = "HALF_DAY",
  ON_LEAVE = "ON_LEAVE"
}

enum PayrollStatus {
  DRAFT = "DRAFT",
  PROCESSING = "PROCESSING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

enum PayrollItemType {
  BASE_SALARY = "BASE_SALARY",
  BONUS = "BONUS",
  OVERTIME = "OVERTIME",
  ALLOWANCE = "ALLOWANCE",
  TAX = "TAX",
  INSURANCE = "INSURANCE",
  DEDUCTION = "DEDUCTION",
  OTHER = "OTHER"
}
```

### Employees

#### GET `/api/admin/hr/employees`
Obtener todos los empleados

**Query Parameters:**
- `page`, `size`, `sort`: Paginación

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "John Doe",
        "userEmail": "john.doe@company.com",
        "employeeNumber": "EMP-001",
        "department": "Engineering",
        "position": "Senior Developer",
        "hireDate": "2023-01-15",
        "salary": 80000.00,
        "status": "ACTIVE",
        "managerId": "uuid",
        "managerName": "Jane Manager"
      }
    ]
  }
}
```

#### GET `/api/admin/hr/employees/{id}`
Obtener empleado por ID

#### POST `/api/admin/hr/employees`
Crear nuevo empleado

**Request:**
```json
{
  "userId": "uuid",
  "employeeNumber": "EMP-001",
  "department": "Engineering",
  "position": "Senior Developer",
  "hireDate": "2023-01-15",
  "salary": 80000.00,
  "status": "ACTIVE",
  "managerId": "uuid"
}
```

#### DELETE `/api/admin/hr/employees/{id}`
Eliminar empleado

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Attendance

#### GET `/api/admin/hr/attendance`
Obtener todos los registros de asistencia

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `employeeId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "employeeId": "uuid",
        "employeeName": "John Doe",
        "employeeNumber": "EMP-001",
        "date": "2024-01-15",
        "checkIn": "2024-01-15T09:00:00",
        "checkOut": "2024-01-15T17:00:00",
        "hoursWorked": 8.0,
        "status": "PRESENT"
      }
    ]
  }
}
```

#### GET `/api/admin/hr/attendance/{id}`
Obtener registro de asistencia por ID

#### POST `/api/admin/hr/attendance`
Crear registro de asistencia

**Request:**
```json
{
  "employeeId": "uuid",
  "date": "2024-01-15",
  "checkIn": "2024-01-15T09:00:00",
  "checkOut": "2024-01-15T17:00:00",
  "status": "PRESENT"
}
```

#### POST `/api/admin/hr/attendance/{employeeId}/check-in`
Registrar entrada de empleado

**Response:** `AttendanceResponse` con `checkIn` actualizado

#### POST `/api/admin/hr/attendance/{employeeId}/check-out`
Registrar salida de empleado

**Response:** `AttendanceResponse` con `checkOut` y `hoursWorked` calculados

### Payroll

#### GET `/api/admin/hr/payroll`
Obtener todos los registros de nómina

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `employeeId`: `UUID` (opcional)
- `status`: `PayrollStatus` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "employeeId": "uuid",
        "employeeName": "John Doe",
        "employeeNumber": "EMP-001",
        "periodStart": "2024-01-01",
        "periodEnd": "2024-01-31",
        "baseSalary": 8000.00,
        "netSalary": 6500.00,
        "status": "APPROVED",
        "items": [
          {
            "id": "uuid",
            "type": "BASE_SALARY",
            "description": "Monthly base salary",
            "amount": 8000.00
          },
          {
            "id": "uuid",
            "type": "TAX",
            "description": "Income tax",
            "amount": -1500.00
          }
        ]
      }
    ]
  }
}
```

#### GET `/api/admin/hr/payroll/{id}`
Obtener nómina por ID

#### POST `/api/admin/hr/payroll`
Crear nómina

**Request:**
```json
{
  "employeeId": "uuid",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "baseSalary": 8000.00,
  "items": [
    {
      "type": "BASE_SALARY",
      "description": "Monthly base salary",
      "amount": 8000.00
    },
    {
      "type": "BONUS",
      "description": "Performance bonus",
      "amount": 1000.00
    },
    {
      "type": "TAX",
      "description": "Income tax",
      "amount": -1500.00
    }
  ]
}
```

**Nota:** El `netSalary` se calcula automáticamente sumando items positivos y restando negativos.

#### PUT `/api/admin/hr/payroll/{id}/approve`
Aprobar nómina

**Response:** `PayrollResponse` con status `APPROVED`

#### DELETE `/api/admin/hr/payroll/{id}`
Eliminar nómina

**Query Parameters:**
- `hard`: `boolean` (default: false)

---

## Projects (Proyectos)

### Base Path: `/api/admin/projects`

### Enums

```typescript
enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

enum TimeEntryStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}
```

### Projects

#### GET `/api/admin/projects`
Obtener todos los proyectos con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `status`: `ProjectStatus` (opcional)
- `managerId`: `UUID` (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Website Redesign",
        "description": "Complete website redesign project",
        "startDate": "2024-01-01",
        "endDate": "2024-03-31",
        "status": "IN_PROGRESS",
        "budget": 50000.00,
        "managerId": "uuid",
        "managerName": "Jane Manager",
        "taskIds": ["uuid1", "uuid2"],
        "totalTasks": 10,
        "totalHours": 120.5
      }
    ]
  }
}
```

#### GET `/api/admin/projects/{id}`
Obtener proyecto por ID

#### POST `/api/admin/projects`
Crear nuevo proyecto

**Request:**
```json
{
  "name": "Website Redesign",
  "description": "Complete website redesign project",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "status": "PLANNING",
  "budget": 50000.00,
  "managerId": "uuid",
  "taskIds": ["uuid1", "uuid2"]
}
```

#### PUT `/api/admin/projects/{id}/status`
Actualizar estado del proyecto

**Query Parameters:**
- `status`: `ProjectStatus`

#### DELETE `/api/admin/projects/{id}`
Eliminar proyecto

**Query Parameters:**
- `hard`: `boolean` (default: false)

### Time Entries

#### GET `/api/admin/projects/{id}/time-entries`
Obtener registros de tiempo de un proyecto

**Query Parameters:**
- `page`, `size`, `sort`: Paginación

#### GET `/api/admin/projects/time-entries`
Obtener todos los registros de tiempo con filtros

**Query Parameters:**
- `page`, `size`, `sort`: Paginación
- `projectId`: `UUID` (opcional)
- `userId`: `UUID` (opcional)
- `startDate`: `string` (ISO date, opcional)
- `endDate`: `string` (ISO date, opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "projectId": "uuid",
        "projectName": "Website Redesign",
        "taskId": "uuid",
        "taskTitle": "Design homepage",
        "userId": "uuid",
        "userName": "John Doe",
        "date": "2024-01-15",
        "hours": 4.5,
        "description": "Worked on homepage design",
        "isBillable": true,
        "status": "SUBMITTED"
      }
    ]
  }
}
```

#### GET `/api/admin/projects/time-entries/{id}`
Obtener registro de tiempo por ID

#### POST `/api/admin/projects/time-entries`
Crear nuevo registro de tiempo

**Request:**
```json
{
  "projectId": "uuid",
  "taskId": "uuid",
  "date": "2024-01-15",
  "hours": 4.5,
  "description": "Worked on homepage design",
  "isBillable": true,
  "status": "DRAFT"
}
```

#### DELETE `/api/admin/projects/time-entries/{id}`
Eliminar registro de tiempo

**Query Parameters:**
- `hard`: `boolean` (default: false)

---

## WebSocket Configuration

### Endpoint de Conexión

**IMPORTANTE:** SockJS usa HTTP/HTTPS, NO el protocolo `ws://` o `wss://`

**URL Correcta:**
```
http://localhost:8080/ws
```

**Para producción (HTTPS):**
```
https://api.splitia.com/ws
```

**URL INCORRECTA (no usar):**
```
ws://localhost:8080/ws  ❌
ws://://localhost:8080/ws  ❌
```

### Configuración en Frontend (Next.js/React)

#### Instalación de Dependencias

```bash
npm install sockjs-client @stomp/stompjs
# o
yarn add sockjs-client @stomp/stompjs
```

#### Configuración de Cliente WebSocket

```typescript
// lib/websocket.ts
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

let stompClient: Client | null = null;

export const connectWebSocket = (token: string, onConnect?: () => void) => {
  // IMPORTANTE: SockJS usa HTTP/HTTPS, NO ws:// o wss://
  // Obtener la URL base del API desde variables de entorno
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const wsUrl = `${apiUrl}/ws`; // Resultado: http://localhost:8080/ws
  
  const socket = new SockJS(wsUrl);
  
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    onConnect: (frame) => {
      console.log('WebSocket Connected:', frame);
      onConnect?.();
    },
    onStompError: (frame) => {
      console.error('WebSocket Error:', frame);
    },
    onDisconnect: () => {
      console.log('WebSocket Disconnected');
    }
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const subscribeToTopic = (
  topic: string,
  callback: (message: IMessage) => void
) => {
  if (stompClient && stompClient.connected) {
    return stompClient.subscribe(topic, callback);
  }
  return null;
};
```

#### Implementación Completa del Servicio WebSocket

```typescript
// lib/websocket/websocket-service.ts
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

export interface WebSocketMessage {
  type: string;
  module: string;
  action: string;
  entityId: string | null;
  entityType: string;
  data: Record<string, any>;
  userId: string | null;
  timestamp: string;
  message: string | null;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();
  private reconnectDelay: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private isConnecting: boolean = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.client && this.client.connected)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      // IMPORTANTE: SockJS usa HTTP/HTTPS, NO ws:// o wss://
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const wsUrl = `${apiUrl}/ws`; // Resultado: http://localhost:8080/ws
      
      console.log('Connecting to WebSocket:', wsUrl);

      const socket = new SockJS(wsUrl);

      this.client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        onConnect: (frame) => {
          console.log('WebSocket Connected:', frame);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        },
        onStompError: (frame) => {
          console.error('WebSocket STOMP Error:', frame);
          this.isConnecting = false;
          reject(new Error(frame.headers['message'] || 'STOMP connection error'));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket Error:', event);
          this.isConnecting = false;
          reject(new Error('WebSocket connection error'));
        },
        onDisconnect: () => {
          console.log('WebSocket Disconnected');
          this.isConnecting = false;
          this.subscriptions.clear();
        },
        onWebSocketClose: (event) => {
          console.log('WebSocket Closed:', event);
          this.isConnecting = false;
          this.subscriptions.clear();
          
          // Intentar reconectar si no excedimos el límite
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
              if (token) {
                this.connect(token).catch(console.error);
              }
            }, this.reconnectDelay);
          }
        }
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(topic: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to:', topic);
      return () => {}; // Retorna función vacía si no está conectado
    }

    // Evitar suscripciones duplicadas
    if (this.subscriptions.has(topic)) {
      console.warn('Already subscribed to:', topic);
      return () => {};
    }

    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
    console.log('Subscribed to:', topic);

    // Retornar función para desuscribirse
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log('Unsubscribed from:', topic);
    };
  }

  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
```

#### Hook de React para WebSocket

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { webSocketService, WebSocketMessage } from '@/lib/websocket/websocket-service';

export const useWebSocket = (
  topics: string[],
  onMessage: (message: WebSocketMessage) => void,
  token: string | null
) => {
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!token) {
      console.warn('No token provided for WebSocket connection');
      return;
    }

    // Conectar y suscribirse
    webSocketService
      .connect(token)
      .then(() => {
        // Suscribirse a todos los topics
        topics.forEach((topic) => {
          const unsubscribe = webSocketService.subscribe(topic, onMessage);
          unsubscribeRefs.current.push(unsubscribe);
        });
      })
      .catch((error) => {
        console.error('Failed to connect WebSocket:', error);
      });

    // Cleanup: desuscribirse y desconectar
    return () => {
      unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = [];
    };
  }, [token, topics, onMessage]);
};
```

#### Ejemplo de Uso en Componente

```typescript
// components/RealTimeNotifications.tsx
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { WebSocketMessage } from '@/lib/websocket/websocket-service';

export default function RealTimeNotifications() {
  const { token } = useAuth();
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('WebSocket Message:', message);
    
    // Mostrar notificación según el tipo
    switch (message.type) {
      case 'OPPORTUNITY_CREATED':
        showNotification('Nueva oportunidad creada', 'success');
        break;
      case 'OPPORTUNITY_STAGE_CHANGED':
        showNotification(`Oportunidad movida a ${message.data.newStage}`, 'info');
        break;
      case 'INVOICE_PAID':
        showNotification('Factura pagada', 'success');
        break;
      case 'STOCK_LOW':
        showNotification(`Stock bajo: ${message.data.productName}`, 'warning');
        break;
      case 'TICKET_CREATED':
        showNotification('Nuevo ticket de soporte', 'info');
        break;
      // ... más casos
    }
  };

  useWebSocket(
    [
      '/topic/notifications',
      '/topic/sales/opportunities',
      '/topic/finance/invoices',
      '/topic/inventory/alerts',
      '/topic/support/tickets'
    ],
    handleWebSocketMessage,
    token
  );

  return null; // Componente invisible que solo maneja WebSocket
}

function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  // Implementar tu sistema de notificaciones aquí
  console.log(`[${type.toUpperCase()}] ${message}`);
}
```

---

## WebSocket Events

### Estructura del Mensaje WebSocket

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

### Topics Disponibles

#### CRM - Sales

**Topic:** `/topic/sales/opportunities`
- `OPPORTUNITY_CREATED`
- `OPPORTUNITY_UPDATED`
- `OPPORTUNITY_STAGE_CHANGED`

**Topic:** `/topic/sales/pipeline`
- `OPPORTUNITY_STAGE_CHANGED` (también se envía aquí)

**Topic:** `/topic/sales/leads`
- `LEAD_CREATED`
- `LEAD_CONVERTED`

**Topic:** `/topic/sales/activities`
- `ACTIVITY_CREATED`

#### CRM - Contacts

**Topic:** `/topic/crm/contacts`
- `CONTACT_CREATED`
- `CONTACT_UPDATED`

**Topic:** `/topic/crm/companies`
- `COMPANY_CREATED`

#### Finance

**Topic:** `/topic/finance/invoices`
- `INVOICE_CREATED`
- `INVOICE_UPDATED`
- `INVOICE_PAID`

**Topic:** `/topic/finance/payments`
- `PAYMENT_RECEIVED`
- `INVOICE_PAID` (también se envía aquí)

#### Inventory

**Topic:** `/topic/inventory/products`
- `PRODUCT_CREATED`
- `PRODUCT_UPDATED`

**Topic:** `/topic/inventory/alerts`
- `STOCK_LOW`

**Topic:** `/topic/inventory/movements`
- `STOCK_MOVEMENT`

#### Procurement

**Topic:** `/topic/procurement/vendors`
- `VENDOR_CREATED`

**Topic:** `/topic/procurement/purchase-orders`
- `PURCHASE_ORDER_CREATED`
- `PURCHASE_ORDER_STATUS_CHANGED`

#### HR

**Topic:** `/topic/hr/employees`
- `EMPLOYEE_CREATED`

**Topic:** `/topic/hr/attendance`
- `ATTENDANCE_CREATED`

**Topic:** `/topic/hr/alerts`
- `ATTENDANCE_ALERT`

**Topic:** `/topic/hr/payroll`
- `PAYROLL_GENERATED`

#### Projects

**Topic:** `/topic/projects`
- `PROJECT_UPDATED`
- `PROJECT_STATUS_CHANGED`

**Topic:** `/topic/projects/{projectId}`
- `PROJECT_UPDATED`
- `PROJECT_STATUS_CHANGED`

**Topic:** `/topic/projects/{projectId}/tasks`
- `TASK_UPDATED`

**Topic:** `/topic/projects/time-entries`
- `TIME_ENTRY_CREATED`

**Topic:** `/topic/tasks`
- `TASK_UPDATED`

#### Marketing

**Topic:** `/topic/marketing/campaigns`
- `CAMPAIGN_STATUS_CHANGED`
- `EMAIL_SENT`

#### Support

**Topic:** `/topic/support/tickets`
- `TICKET_CREATED`
- `TICKET_UPDATED`
- `TICKET_STATUS_CHANGED`

#### General

**Topic:** `/topic/notifications`
- `GLOBAL_NOTIFICATION`
- `STOCK_LOW` (también se envía aquí)
- `ATTENDANCE_ALERT` (también se envía aquí)

**Topic:** `/topic/sla/alerts`
- `SLA_ALERT`

**Topic:** `/topic/workflows`
- `WORKFLOW_EXECUTED`

**Topic:** `/topic/audit/logs`
- `AUDIT_LOG_CREATED`

### Ejemplos de Mensajes WebSocket

#### Oportunidad Creada

```json
{
  "type": "OPPORTUNITY_CREATED",
  "module": "CRM",
  "action": "CREATED",
  "entityId": "uuid",
  "entityType": "Opportunity",
  "data": {
    "opportunity": {
      "id": "uuid",
      "name": "Enterprise Deal",
      "stage": "LEAD",
      "estimatedValue": 50000.00
    }
  },
  "userId": "uuid",
  "timestamp": "2024-01-15T10:30:00",
  "message": null
}
```

#### Cambio de Etapa de Oportunidad

```json
{
  "type": "OPPORTUNITY_STAGE_CHANGED",
  "module": "CRM",
  "action": "STATUS_CHANGED",
  "entityId": "uuid",
  "entityType": "Opportunity",
  "data": {
    "oldStage": "LEAD",
    "newStage": "QUALIFIED"
  },
  "userId": "uuid",
  "timestamp": "2024-01-15T10:35:00",
  "message": null
}
```

#### Factura Pagada

```json
{
  "type": "INVOICE_PAID",
  "module": "FINANCE",
  "action": "PAID",
  "entityId": "uuid",
  "entityType": "Invoice",
  "data": {
    "invoice": {
      "id": "uuid",
      "invoiceNumber": "INV-2024-000001",
      "status": "PAID",
      "total": 1100.00
    },
    "payment": {
      "id": "uuid",
      "amount": 1100.00
    }
  },
  "userId": "uuid",
  "timestamp": "2024-01-15T11:00:00",
  "message": null
}
```

#### Alerta de Stock Bajo

```json
{
  "type": "STOCK_LOW",
  "module": "INVENTORY",
  "action": "ALERT",
  "entityId": "uuid",
  "entityType": "Stock",
  "data": {
    "productId": "uuid",
    "productName": "Product A",
    "currentQuantity": 5,
    "minQuantity": 10
  },
  "userId": null,
  "timestamp": "2024-01-15T09:00:00",
  "message": null
}
```

#### Orden de Compra Recibida

```json
{
  "type": "PURCHASE_ORDER_STATUS_CHANGED",
  "module": "PROCUREMENT",
  "action": "STATUS_CHANGED",
  "entityId": "uuid",
  "entityType": "PurchaseOrder",
  "data": {
    "oldStatus": "ORDERED",
    "newStatus": "RECEIVED"
  },
  "userId": "uuid",
  "timestamp": "2024-01-15T12:00:00",
  "message": null
}
```

---

## Manejo de Errores

### Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error de validación o solicitud inválida
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Sin permisos para acceder al recurso
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

### Formato de Error

```json
{
  "success": false,
  "data": null,
  "message": "Error message here",
  "timestamp": "2024-01-15T10:00:00"
}
```

### Ejemplo de Manejo en Frontend

```typescript
try {
  const response = await fetch('/api/admin/sales/opportunities', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }
  
  return data.data;
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

---

## Notas Importantes

1. **Autenticación**: Todas las rutas `/api/admin/**` requieren autenticación JWT y rol ADMIN.

2. **Paginación**: Los endpoints de listado siempre devuelven `Page<T>`. Usar `page`, `size` y `sort` como query parameters.

3. **Soft Delete**: Por defecto, los DELETE son soft delete (marcan `deletedAt`). Usar `?hard=true` para eliminación permanente.

4. **UUIDs**: Todos los IDs son UUIDs en formato string.

5. **Fechas**: Todas las fechas están en formato ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`).

6. **WebSocket**: El endpoint `/ws` está permitido sin autenticación en la configuración, pero se recomienda enviar el token en los headers de conexión.

7. **CORS**: El backend está configurado para aceptar requests desde `localhost:3000`, `localhost:3001` y `splitia-next.vercel.app`.

8. **Validación**: Todos los DTOs de request están validados con Jakarta Validation. Los errores de validación se devuelven con código 400.

---

## Ejemplo Completo de Integración

```typescript
// lib/api/sales.ts
import { ApiResponse, PageResponse, OpportunityResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const salesApi = {
  async getOpportunities(
    page: number = 0,
    size: number = 20,
    stage?: string,
    assignedToId?: string
  ): Promise<PageResponse<OpportunityResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(stage && { stage }),
      ...(assignedToId && { assignedToId })
    });

    const response = await fetch(
      `${API_BASE_URL}/admin/sales/opportunities?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch opportunities');
    }

    const data: ApiResponse<PageResponse<OpportunityResponse>> = await response.json();
    return data.data;
  },

  async createOpportunity(opportunity: CreateOpportunityRequest): Promise<OpportunityResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/sales/opportunities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opportunity)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create opportunity');
    }

    const data: ApiResponse<OpportunityResponse> = await response.json();
    return data.data;
  }
};
```

---

**Última actualización:** Enero 2024
**Versión del Backend:** Spring Boot 3.x
**Versión del Frontend Compatible:** Next.js 14+

