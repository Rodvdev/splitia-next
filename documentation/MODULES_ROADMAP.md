# Plan de Desarrollo - Módulos Restantes Splitia CRM/ERP

## Estado Actual

### ✅ Módulos Completados
1. **Pipeline de Ventas** - Oportunidades, leads, forecasting
2. **Gestión de Contactos** - Contactos y empresas CRM
3. **Contabilidad y Finanzas** - Facturas, pagos, transacciones básicas
4. **Auditoría y Compliance** - Logs, GDPR, exportación de datos
5. **WebSocket Integration** - Comunicación en tiempo real completa

---

## 📋 Módulos Pendientes - Plan Detallado

### 1. Marketing Automation 🎯
**Prioridad:** Alta  
**Complejidad:** Media-Alta  
**Tiempo estimado:** 2-3 semanas

#### Funcionalidades:
- **Campañas de Email**
  - Creación de campañas (drag & drop editor)
  - Segmentación de audiencia
  - Programación y envío automático
  - Tracking de aperturas y clicks
  - A/B testing

- **Workflows Automatizados**
  - Constructor visual de workflows
  - Triggers (eventos, fechas, condiciones)
  - Acciones (enviar email, crear tarea, cambiar etapa)
  - Condiciones y ramificaciones
  - Testing y debugging

- **Landing Pages**
  - Constructor de páginas
  - Formularios integrados
  - Conversión a leads automática
  - Analytics de conversión

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/marketing/
├── campaigns/
│   ├── page.tsx                    # Lista de campañas
│   ├── create/page.tsx             # Crear campaña
│   ├── [id]/
│   │   ├── page.tsx                # Detalle campaña
│   │   ├── edit/page.tsx           # Editar campaña
│   │   ├── analytics/page.tsx      # Analytics de campaña
│   │   └── preview/page.tsx        # Preview del email
│   └── templates/page.tsx          # Plantillas de email
├── workflows/
│   ├── page.tsx                    # Lista de workflows
│   ├── create/page.tsx             # Crear workflow
│   ├── [id]/
│   │   ├── page.tsx                # Editor visual de workflow
│   │   ├── edit/page.tsx           # Editar workflow
│   │   └── logs/page.tsx           # Logs de ejecución
│   └── builder/
│       └── page.tsx                # Constructor visual
├── landing-pages/
│   ├── page.tsx                    # Lista de landing pages
│   ├── create/page.tsx             # Crear landing page
│   └── [id]/
│       ├── page.tsx                # Editor de landing page
│       └── analytics/page.tsx      # Analytics
└── analytics/
    └── page.tsx                    # Dashboard de marketing

src/components/marketing/
├── CampaignEditor.tsx              # Editor de campañas
├── WorkflowBuilder.tsx             # Constructor visual de workflows
├── EmailTemplateEditor.tsx          # Editor de plantillas
├── LandingPageBuilder.tsx           # Constructor de landing pages
├── SegmentBuilder.tsx               # Constructor de segmentos
└── CampaignAnalytics.tsx            # Gráficos de campañas

src/types/api/marketing.ts           # Tipos de marketing
src/lib/api/marketing.ts             # API client de marketing
src/hooks/useCampaigns.ts            # Hooks de campañas
src/hooks/useWorkflows.ts            # Hooks de workflows
```

---

### 2. Análisis Avanzado de Clientes 📊
**Prioridad:** Alta  
**Complejidad:** Media  
**Tiempo estimado:** 1-2 semanas

#### Funcionalidades:
- **LTV (Lifetime Value)**
  - Cálculo automático por cliente
  - Proyecciones y tendencias
  - Segmentación por LTV

- **Churn Analysis**
  - Tasa de churn mensual/anual
  - Predicción de churn
  - Análisis de causas
  - Alertas de riesgo

- **Engagement Score**
  - Métricas de engagement
  - Scoring automático
  - Segmentación por engagement
  - Recomendaciones de acciones

- **Cohort Analysis**
  - Análisis por cohortes
  - Retención por cohorte
  - Comparación de cohortes

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/analytics/
├── customers/
│   ├── page.tsx                    # Dashboard de análisis de clientes
│   ├── ltv/page.tsx                # Análisis LTV
│   ├── churn/page.tsx              # Análisis de churn
│   ├── engagement/page.tsx          # Engagement score
│   └── cohorts/page.tsx             # Cohort analysis
└── reports/
    ├── page.tsx                    # Reportes personalizados
    └── [id]/page.tsx                # Detalle de reporte

src/components/analytics/
├── LTVChart.tsx                     # Gráfico de LTV
├── ChurnChart.tsx                   # Gráfico de churn
├── EngagementScore.tsx              # Visualización de engagement
├── CohortTable.tsx                  # Tabla de cohortes
├── ChurnPrediction.tsx              # Predicción de churn
└── CustomerSegmentation.tsx          # Segmentación de clientes

src/types/api/analytics.ts            # Tipos de analytics
src/lib/api/analytics.ts             # API client de analytics
src/hooks/useCustomerAnalytics.ts    # Hooks de analytics
```

---

### 3. Gestión de Inventario y Productos 📦
**Prioridad:** Media  
**Complejidad:** Media  
**Tiempo estimado:** 1-2 semanas

#### Funcionalidades:
- **Productos**
  - CRUD completo de productos
  - Categorías y variantes
  - SKU y códigos de barras
  - Imágenes y descripciones
  - Precios y descuentos

- **Inventario**
  - Control de stock
  - Movimientos de inventario
  - Alertas de stock bajo
  - Ajustes de inventario
  - Historial de movimientos

- **Categorías**
  - Árbol de categorías
  - Atributos personalizados
  - Filtros y búsqueda

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/inventory/
├── products/
│   ├── page.tsx                    # Lista de productos
│   ├── create/page.tsx             # Crear producto
│   └── [id]/
│       ├── page.tsx                # Detalle producto
│       ├── edit/page.tsx           # Editar producto
│       └── history/page.tsx         # Historial de movimientos
├── categories/
│   ├── page.tsx                    # Árbol de categorías
│   ├── create/page.tsx             # Crear categoría
│   └── [id]/page.tsx               # Editar categoría
├── movements/
│   ├── page.tsx                    # Movimientos de inventario
│   └── create/page.tsx             # Crear movimiento
└── alerts/
    └── page.tsx                    # Alertas de stock

src/components/inventory/
├── ProductCard.tsx                  # Tarjeta de producto
├── StockLevel.tsx                   # Indicador de stock
├── CategoryTree.tsx                 # Árbol de categorías
├── InventoryMovement.tsx            # Formulario de movimiento
└── StockAlert.tsx                   # Alerta de stock

src/types/api/inventory.ts            # Tipos de inventario
src/lib/api/inventory.ts              # API client de inventario
src/hooks/useProducts.ts              # Hooks de productos
src/hooks/useInventory.ts             # Hooks de inventario
```

---

### 4. Gestión de Proveedores y Órdenes de Compra 🏢
**Prioridad:** Media  
**Complejidad:** Media  
**Tiempo estimado:** 1-2 semanas

#### Funcionalidades:
- **Proveedores**
  - CRUD de proveedores
  - Información de contacto
  - Términos de pago
  - Historial de compras
  - Evaluación de proveedores

- **Órdenes de Compra**
  - Creación de órdenes
  - Aprobación de órdenes
  - Recepción de mercancía
  - Facturación y pagos
  - Tracking de estado

- **Contratos**
  - Gestión de contratos
  - Renovaciones automáticas
  - Alertas de vencimiento

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/procurement/
├── vendors/
│   ├── page.tsx                    # Lista de proveedores
│   ├── create/page.tsx             # Crear proveedor
│   └── [id]/
│       ├── page.tsx                # Detalle proveedor
│       ├── edit/page.tsx           # Editar proveedor
│       └── orders/page.tsx         # Órdenes del proveedor
├── purchase-orders/
│   ├── page.tsx                    # Lista de órdenes
│   ├── create/page.tsx             # Crear orden
│   └── [id]/
│       ├── page.tsx                # Detalle orden
│       ├── approve/page.tsx         # Aprobar orden
│       └── receive/page.tsx        # Recepción de mercancía
└── contracts/
    ├── page.tsx                    # Lista de contratos
    ├── create/page.tsx             # Crear contrato
    └── [id]/page.tsx               # Detalle contrato

src/components/procurement/
├── VendorCard.tsx                   # Tarjeta de proveedor
├── PurchaseOrderForm.tsx            # Formulario de orden
├── OrderApproval.tsx                # Componente de aprobación
├── ReceiptForm.tsx                  # Formulario de recepción
└── ContractCard.tsx                 # Tarjeta de contrato

src/types/api/procurement.ts          # Tipos de procurement
src/lib/api/procurement.ts            # API client de procurement
src/hooks/useVendors.ts               # Hooks de proveedores
src/hooks/usePurchaseOrders.ts        # Hooks de órdenes
```

---

### 5. Recursos Humanos 👥
**Prioridad:** Media  
**Complejidad:** Media-Alta  
**Tiempo estimado:** 2 semanas

#### Funcionalidades:
- **Empleados**
  - CRUD de empleados
  - Información personal y laboral
  - Documentos y certificados
  - Evaluaciones de desempeño
  - Historial de cambios

- **Asistencia**
  - Registro de entrada/salida
  - Horarios y turnos
  - Vacaciones y permisos
  - Reportes de asistencia

- **Nómina**
  - Cálculo de salarios
  - Deducciones y bonos
  - Generación de recibos
  - Historial de pagos

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/hr/
├── employees/
│   ├── page.tsx                    # Lista de empleados
│   ├── create/page.tsx             # Crear empleado
│   └── [id]/
│       ├── page.tsx                # Perfil empleado
│       ├── edit/page.tsx            # Editar empleado
│       ├── attendance/page.tsx      # Asistencia
│       ├── documents/page.tsx       # Documentos
│       └── performance/page.tsx     # Evaluaciones
├── attendance/
│   ├── page.tsx                    # Registro de asistencia
│   ├── timesheet/page.tsx          # Hoja de tiempo
│   └── reports/page.tsx            # Reportes
├── payroll/
│   ├── page.tsx                    # Nómina
│   ├── calculate/page.tsx          # Calcular nómina
│   └── payslips/page.tsx           # Recibos de pago
└── leaves/
    ├── page.tsx                    # Solicitudes de vacaciones
    └── calendar/page.tsx           # Calendario de vacaciones

src/components/hr/
├── EmployeeCard.tsx                 # Tarjeta de empleado
├── AttendanceClock.tsx              # Reloj de asistencia
├── Timesheet.tsx                    # Hoja de tiempo
├── PayrollCalculator.tsx            # Calculadora de nómina
├── LeaveRequestForm.tsx             # Formulario de vacaciones
└── PerformanceReview.tsx            # Evaluación de desempeño

src/types/api/hr.ts                   # Tipos de HR
src/lib/api/hr.ts                     # API client de HR
src/hooks/useEmployees.ts             # Hooks de empleados
src/hooks/useAttendance.ts            # Hooks de asistencia
src/hooks/usePayroll.ts               # Hooks de nómina
```

---

### 6. Gestión Avanzada de Proyectos 📅
**Prioridad:** Media  
**Complejidad:** Alta  
**Tiempo estimado:** 3-4 semanas

#### Funcionalidades:
- **Proyectos**
  - CRUD de proyectos
  - Fases y hitos
  - Asignación de recursos
  - Presupuesto y costos

- **Gantt Chart**
  - Vista de Gantt interactiva
  - Dependencias entre tareas
  - Drag & drop de tareas
  - Zoom y filtros

- **Time Tracking**
  - Registro de tiempo por tarea
  - Timer integrado
  - Reportes de tiempo
  - Facturación por tiempo

- **Tareas y Subtareas**
  - Gestión de tareas
  - Subtareas anidadas
  - Checklists
  - Archivos adjuntos

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/projects/
├── page.tsx                        # Lista de proyectos
├── create/page.tsx                 # Crear proyecto
├── [id]/
│   ├── page.tsx                    # Dashboard del proyecto
│   ├── edit/page.tsx               # Editar proyecto
│   ├── gantt/page.tsx              # Vista Gantt
│   ├── tasks/page.tsx               # Tareas del proyecto
│   ├── timeline/page.tsx            # Timeline
│   ├── resources/page.tsx           # Recursos
│   └── reports/page.tsx             # Reportes
└── time-tracking/
    ├── page.tsx                    # Time tracking
    └── reports/page.tsx            # Reportes de tiempo

src/components/projects/
├── ProjectCard.tsx                  # Tarjeta de proyecto
├── GanttChart.tsx                   # Componente Gantt
├── TaskBoard.tsx                    # Tablero de tareas
├── TimeTracker.tsx                  # Timer de tiempo
├── ResourceAllocation.tsx          # Asignación de recursos
├── ProjectTimeline.tsx              # Timeline del proyecto
└── TaskDependencies.tsx             # Dependencias de tareas

src/types/api/projects.ts             # Tipos de proyectos
src/lib/api/projects.ts               # API client de proyectos
src/hooks/useProjects.ts              # Hooks de proyectos
src/hooks/useGantt.ts                 # Hooks de Gantt
src/hooks/useTimeTracking.ts          # Hooks de time tracking
```

---

### 7. Sistema de Reportes Personalizados 📈
**Prioridad:** Media  
**Complejidad:** Alta  
**Tiempo estimado:** 2-3 semanas

#### Funcionalidades:
- **Constructor de Reportes**
  - Drag & drop de campos
  - Filtros avanzados
  - Agrupaciones y agregaciones
  - Ordenamiento
  - Formatos de salida (PDF, Excel, CSV)

- **Dashboards Configurables**
  - Widgets personalizables
  - Múltiples layouts
  - Filtros globales
  - Compartir dashboards

- **Reportes Programados**
  - Programación de reportes
  - Envío automático por email
  - Historial de ejecuciones

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/reports/
├── page.tsx                        # Lista de reportes
├── create/page.tsx                 # Crear reporte
├── [id]/
│   ├── page.tsx                    # Ver reporte
│   ├── edit/page.tsx               # Editar reporte
│   ├── builder/page.tsx            # Constructor visual
│   └── schedule/page.tsx           # Programar reporte
├── dashboards/
│   ├── page.tsx                    # Lista de dashboards
│   ├── create/page.tsx             # Crear dashboard
│   └── [id]/
│       ├── page.tsx                # Dashboard personalizado
│       └── edit/page.tsx           # Editar dashboard
└── templates/
    └── page.tsx                    # Plantillas de reportes

src/components/reports/
├── ReportBuilder.tsx                # Constructor de reportes
├── DashboardBuilder.tsx             # Constructor de dashboards
├── WidgetSelector.tsx               # Selector de widgets
├── FilterBuilder.tsx                # Constructor de filtros
├── ChartWidget.tsx                  # Widget de gráfico
├── TableWidget.tsx                  # Widget de tabla
└── MetricWidget.tsx                 # Widget de métrica

src/types/api/reports.ts              # Tipos de reportes
src/lib/api/reports.ts                # API client de reportes
src/hooks/useReports.ts               # Hooks de reportes
src/hooks/useDashboards.ts            # Hooks de dashboards
```

---

### 8. Constructor Visual de Workflows 🔄
**Prioridad:** Alta  
**Complejidad:** Muy Alta  
**Tiempo estimado:** 3-4 semanas

#### Funcionalidades:
- **Editor Visual**
  - Canvas interactivo
  - Nodos y conexiones
  - Drag & drop
  - Zoom y pan
  - Validación de workflows

- **Tipos de Nodos**
  - Triggers (eventos, webhooks, fechas)
  - Acciones (email, crear registro, actualizar)
  - Condiciones (if/else, switch)
  - Loops y iteraciones
  - Delays y esperas

- **Testing y Debugging**
  - Ejecución paso a paso
  - Logs de ejecución
  - Variables y contexto
  - Breakpoints

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/automation/
├── workflows/
│   ├── page.tsx                    # Lista de workflows
│   ├── create/page.tsx             # Crear workflow
│   └── [id]/
│       ├── page.tsx                # Editor visual
│       ├── edit/page.tsx           # Editar workflow
│       ├── test/page.tsx           # Testing
│       └── logs/page.tsx           # Logs de ejecución
└── templates/
    └── page.tsx                    # Plantillas de workflows

src/components/automation/
├── WorkflowCanvas.tsx               # Canvas principal
├── WorkflowNode.tsx                 # Nodo del workflow
├── WorkflowConnection.tsx            # Conexión entre nodos
├── NodePalette.tsx                  # Paleta de nodos
├── NodeEditor.tsx                   # Editor de nodo
├── WorkflowDebugger.tsx             # Debugger de workflow
└── WorkflowValidator.tsx           # Validador de workflow

src/lib/workflow/
├── engine.ts                        # Motor de ejecución
├── nodes.ts                         # Definiciones de nodos
├── validators.ts                    # Validadores
└── executors.ts                     # Ejecutores de acciones

src/types/api/automation.ts           # Tipos de automation
src/lib/api/automation.ts             # API client de automation
src/hooks/useWorkflows.ts             # Hooks de workflows
```

---

### 9. Gestión de Documentos 📄
**Prioridad:** Media  
**Complejidad:** Media-Alta  
**Tiempo estimado:** 2 semanas

#### Funcionalidades:
- **Gestión de Documentos**
  - Upload y almacenamiento
  - Categorización y tags
  - Búsqueda avanzada
  - Preview de documentos
  - Descarga y compartir

- **Versionado**
  - Historial de versiones
  - Comparación de versiones
  - Restaurar versiones
  - Comentarios por versión

- **Control de Acceso**
  - Permisos granulares
  - Compartir con usuarios/grupos
  - Enlaces públicos temporales
  - Auditoría de acceso

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/documents/
├── page.tsx                        # Lista de documentos
├── upload/page.tsx                 # Subir documento
├── [id]/
│   ├── page.tsx                    # Ver documento
│   ├── edit/page.tsx               # Editar metadata
│   ├── versions/page.tsx            # Versiones
│   ├── permissions/page.tsx          # Permisos
│   └── share/page.tsx              # Compartir
└── categories/
    └── page.tsx                    # Categorías

src/components/documents/
├── DocumentCard.tsx                 # Tarjeta de documento
├── DocumentViewer.tsx               # Visor de documentos
├── VersionHistory.tsx               # Historial de versiones
├── PermissionManager.tsx            # Gestor de permisos
├── DocumentUpload.tsx               # Upload de documentos
└── DocumentSearch.tsx               # Búsqueda avanzada

src/types/api/documents.ts            # Tipos de documentos
src/lib/api/documents.ts              # API client de documentos
src/hooks/useDocuments.ts             # Hooks de documentos
```

---

### 10. Sistema de Integraciones 🔌
**Prioridad:** Media  
**Complejidad:** Alta  
**Tiempo estimado:** 2-3 semanas

#### Funcionalidades:
- **API Management**
  - Gestión de API keys
  - Rate limiting
  - Logs de API
  - Documentación de API
  - Webhooks

- **Integraciones Pre-construidas**
  - Slack
  - Notion
  - Google Sheets
  - Zapier
  - Make (Integromat)

- **Webhooks**
  - Creación de webhooks
  - Testing de webhooks
  - Logs de webhooks
  - Reintentos automáticos

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/integrations/
├── page.tsx                        # Lista de integraciones
├── api-keys/
│   ├── page.tsx                    # API keys
│   └── create/page.tsx             # Crear API key
├── webhooks/
│   ├── page.tsx                    # Lista de webhooks
│   ├── create/page.tsx             # Crear webhook
│   └── [id]/
│       ├── page.tsx                # Detalle webhook
│       └── logs/page.tsx           # Logs de webhook
├── connectors/
│   ├── slack/page.tsx              # Integración Slack
│   ├── notion/page.tsx             # Integración Notion
│   ├── google-sheets/page.tsx      # Integración Google Sheets
│   └── zapier/page.tsx             # Integración Zapier
└── api-docs/
    └── page.tsx                    # Documentación de API

src/components/integrations/
├── ApiKeyManager.tsx                # Gestor de API keys
├── WebhookForm.tsx                  # Formulario de webhook
├── WebhookTester.tsx                # Tester de webhook
├── IntegrationCard.tsx              # Tarjeta de integración
├── ConnectorSetup.tsx               # Setup de conector
└── ApiDocs.tsx                      # Documentación de API

src/types/api/integrations.ts         # Tipos de integraciones
src/lib/api/integrations.ts           # API client de integraciones
src/hooks/useIntegrations.ts          # Hooks de integraciones
src/hooks/useWebhooks.ts              # Hooks de webhooks
```

---

### 11. Dashboard Ejecutivo Mejorado 📊
**Prioridad:** Alta  
**Complejidad:** Media  
**Tiempo estimado:** 1-2 semanas

#### Funcionalidades:
- **KPIs Personalizables**
  - Selección de KPIs
  - Configuración de métricas
  - Comparaciones y tendencias
  - Alertas de KPIs

- **Widgets Avanzados**
  - Gráficos interactivos
  - Tablas dinámicas
  - Mapas de calor
  - Indicadores de tendencia
  - Comparaciones temporales

- **Filtros Globales**
  - Filtros por fecha
  - Filtros por segmento
  - Filtros por región
  - Guardar filtros

#### Estructura de Archivos:
```
src/app/(dashboard)/admin/dashboard/
├── page.tsx                        # Dashboard ejecutivo
├── customize/page.tsx               # Personalizar dashboard
└── widgets/
    ├── kpi-widget/page.tsx         # Widget de KPI
    ├── chart-widget/page.tsx       # Widget de gráfico
    └── table-widget/page.tsx       # Widget de tabla

src/components/dashboard/
├── KPICard.tsx                      # Tarjeta de KPI
├── TrendIndicator.tsx               # Indicador de tendencia
├── ComparisonChart.tsx              # Gráfico de comparación
├── HeatMap.tsx                      # Mapa de calor
├── MetricSelector.tsx               # Selector de métricas
└── FilterBar.tsx                    # Barra de filtros

src/types/api/dashboard.ts            # Tipos de dashboard
src/lib/api/dashboard.ts              # API client de dashboard
src/hooks/useDashboard.ts             # Hooks de dashboard
```

---

## Priorización Recomendada

### Fase 1 (Inmediata - 1 mes)
1. ✅ Marketing Automation (Campañas básicas)
2. ✅ Análisis Avanzado de Clientes (LTV, Churn)
3. ✅ Dashboard Ejecutivo Mejorado

### Fase 2 (Corto plazo - 2 meses)
4. ✅ Gestión de Inventario y Productos
5. ✅ Gestión de Proveedores y Órdenes de Compra
6. ✅ Sistema de Reportes Personalizados (básico)

### Fase 3 (Medio plazo - 3 meses)
7. ✅ Recursos Humanos
8. ✅ Gestión Avanzada de Proyectos (Gantt básico)
9. ✅ Gestión de Documentos

### Fase 4 (Largo plazo - 4+ meses)
10. ✅ Constructor Visual de Workflows (completo)
11. ✅ Sistema de Integraciones (completo)

---

## Consideraciones Técnicas

### Librerías Necesarias
- **Gantt Chart**: `dhtmlx-gantt` o `@dhtmlx/gantt`
- **Workflow Builder**: `react-flow` o `react-diagrams`
- **Document Viewer**: `react-pdf` o `@react-pdf-viewer`
- **Charts**: `recharts` (ya instalado)
- **Drag & Drop**: `@dnd-kit` (ya instalado)

### Patrones a Seguir
1. **Estructura consistente**: Mismo patrón en todos los módulos
2. **API Logging**: Todos los endpoints con `apiLogger`
3. **WebSocket**: Actualizaciones en tiempo real donde aplique
4. **TypeScript**: Tipos estrictos en todos los módulos
5. **Validación**: React Hook Form + Zod en formularios
6. **Error Handling**: Try/catch con toasts
7. **Loading States**: Spinners y skeletons
8. **Empty States**: Componentes EmptyState consistentes

### Testing
- Unit tests para hooks y utilidades
- Integration tests para flujos críticos
- E2E tests para workflows principales

---

## Notas Finales

Este plan es ambicioso pero estructurado. Cada módulo puede desarrollarse de forma incremental, empezando por funcionalidades básicas y expandiendo gradualmente.

La clave es mantener la consistencia en la arquitectura y seguir los patrones establecidos en los módulos ya implementados.

