# Prompt: Estructura de Navegación Completa para Splitia

## Contexto del Proyecto
Splitia es una aplicación web de gestión de gastos compartidos con las siguientes características principales:
- Gestión de gastos individuales y grupales
- Sistema de grupos con roles (ADMIN, MEMBER, GUEST, ASSISTANT)
- Sistema de presupuestos mensuales
- Chat integrado (individual y grupal)
- Asistente IA para gestión de gastos
- Sistema de suscripciones (FREE, PREMIUM, ENTERPRISE)
- Sistema de soporte con tickets
- Panel administrativo completo

## Objetivo
Crear una estructura de navegación completa y detallada para dos dashboards:
1. **Dashboard de Usuario** - Para usuarios finales de la aplicación
2. **Dashboard de Administración** - Para administradores del sistema

## Requisitos de Navegación

### 1. Dashboard de Usuario

#### 1.1 Estructura Principal
- **Layout**: Sidebar izquierdo con navegación principal + Header superior con perfil de usuario
- **Responsive**: Menú hamburguesa en móvil, sidebar completo en desktop
- **Temas**: Soporte para modo claro/oscuro
- **Idiomas**: Español, Inglés, Portugués

#### 1.2 Menú Principal de Usuario

##### Dashboard Principal (`/dashboard`)
- **Ícono**: LayoutDashboard
- **Descripción**: Vista general con resumen de gastos, grupos y actividad reciente
- **Subsecciones**:
  - Resumen de gastos totales
  - Grupos activos (carousel)
  - Actividad reciente
  - Miembros de grupos
  - Estadísticas rápidas

##### Gastos (`/dashboard/expenses`)
- **Ícono**: Receipt
- **Descripción**: Gestión completa de gastos individuales y grupales
- **Subsecciones**:
  - Lista de gastos (`/dashboard/expenses`)
  - Crear gasto (`/dashboard/expenses/create`)
  - Detalle de gasto (`/dashboard/expenses/[id]`)
  - Filtros: Por categoría, fecha, grupo, moneda
  - Búsqueda: Por descripción, ubicación, notas

##### Grupos (`/dashboard/groups`)
- **Ícono**: Users
- **Descripción**: Gestión de grupos para gastos compartidos
- **Subsecciones**:
  - Lista de grupos (`/dashboard/groups`)
  - Crear grupo (`/dashboard/groups/create`)
  - Detalle de grupo (`/dashboard/groups/[id]`)
  - Invitar miembros (`/dashboard/groups/[id]/invite`)
  - Balances del grupo
  - Historial de gastos del grupo
  - Asentamientos (settlements)

##### Presupuesto (`/dashboard/budget`)
- **Ícono**: Wallet
- **Descripción**: Gestión de presupuestos mensuales por categoría
- **Subsecciones**:
  - Vista de presupuesto actual (`/dashboard/budget`)
  - Crear/editar presupuesto (`/dashboard/budget/create`)
  - Selección de mes/año
  - Categorías de presupuesto
  - Progreso de gastos vs presupuesto
  - Alertas de exceso de presupuesto

##### Chat (`/dashboard/chat`)
- **Ícono**: MessageSquare
- **Descripción**: Sistema de mensajería integrado
- **Subsecciones**:
  - Lista de conversaciones (`/dashboard/chat`)
  - Crear conversación (`/dashboard/chat/create`)
  - Conversación individual (`/dashboard/chat/[id]`)
  - Chat de grupo (integrado con grupos)
  - Mensajes no leídos
  - Búsqueda de mensajes

##### Configuración (`/dashboard/settings`)
- **Ícono**: Settings
- **Descripción**: Configuración de perfil y preferencias
- **Subsecciones**:
  - Perfil de usuario
  - Preferencias (moneda, idioma, tema)
  - Notificaciones
  - Seguridad
  - Privacidad

##### Perfil (`/dashboard/profile`)
- **Ícono**: User
- **Descripción**: Información del perfil de usuario
- **Subsecciones**:
  - Información personal
  - Foto de perfil
  - Historial de actividad
  - Estadísticas personales

##### Suscripción (`/dashboard/subscription`)
- **Ícono**: CreditCard
- **Descripción**: Gestión de plan de suscripción
- **Subsecciones**:
  - Plan actual
  - Cambiar plan
  - Historial de pagos
  - Métodos de pago
  - Facturas

##### Soporte (`/dashboard/support`)
- **Ícono**: HelpCircle
- **Descripción**: Sistema de tickets de soporte
- **Subsecciones**:
  - Crear ticket (`/dashboard/support/create`)
  - Mis tickets (`/dashboard/support`)
  - Detalle de ticket (`/dashboard/support/[id]`)
  - Base de conocimiento
  - Chat en vivo (si está disponible)

#### 1.3 Navegación Secundaria (Header)
- **Perfil de Usuario**: Dropdown con:
  - Ver perfil
  - Configuración
  - Cerrar sesión
- **Notificaciones**: Bell icon con dropdown de notificaciones
- **Búsqueda Global**: Barra de búsqueda para buscar en toda la aplicación
- **Selector de Idioma**: Cambio rápido de idioma
- **Selector de Tema**: Cambio rápido entre claro/oscuro

#### 1.4 Breadcrumbs
- Mostrar ruta completa en páginas anidadas
- Ejemplo: Dashboard > Grupos > Viaje a París > Gastos

#### 1.5 Navegación Contextual
- En páginas de grupo: Mostrar acciones rápidas del grupo
- En páginas de gasto: Mostrar acciones relacionadas (editar, eliminar, compartir)
- En chat: Mostrar información del contacto/grupo

### 2. Dashboard de Administración

#### 2.1 Estructura Principal
- **Layout**: Sidebar izquierdo con navegación administrativa + Header superior con perfil de admin
- **Seguridad**: Requiere autenticación de administrador
- **Roles**: Super Admin, Admin, Support Agent, Developer

#### 2.2 Menú Principal de Administración

##### Dashboard Admin (`/admin`)
- **Ícono**: LayoutDashboard
- **Descripción**: Vista general del sistema
- **Métricas**:
  - Total de usuarios
  - Usuarios activos
  - Grupos activos
  - Ingresos (MRR/ARR)
  - Tickets de soporte abiertos
  - Estado del sistema

##### Usuarios (`/admin/users`)
- **Ícono**: Users
- **Descripción**: Gestión completa de usuarios
- **Subsecciones**:
  - Lista de usuarios (`/admin/users`)
  - Detalle de usuario (`/admin/users/[id]`)
  - Crear usuario (`/admin/users/create`)
  - Filtros: Por estado, plan, fecha de registro, idioma
  - Búsqueda: Por nombre, email, ID
  - Acciones masivas: Suspender, activar, cambiar plan
  - Exportar datos

##### Grupos (`/admin/groups`)
- **Ícono**: Users
- **Descripción**: Gestión y moderación de grupos
- **Subsecciones**:
  - Lista de grupos (`/admin/groups`)
  - Detalle de grupo (`/admin/groups/[id]`)
  - Moderación de grupos
  - Suspender grupos problemáticos
  - Intervención en conversaciones
  - Limpieza de grupos inactivos

##### Gastos (`/admin/expenses`)
- **Ícono**: Receipt
- **Descripción**: Visualización y moderación de gastos
- **Subsecciones**:
  - Lista de todos los gastos
  - Filtros avanzados
  - Búsqueda global
  - Moderación de gastos reportados
  - Estadísticas de gastos

##### Suscripciones (`/admin/subscriptions`)
- **Ícono**: CreditCard
- **Descripción**: Gestión de planes y suscripciones
- **Subsecciones**:
  - Gestión de planes (`/admin/subscriptions/plans`)
  - Crear/editar plan (`/admin/subscriptions/plans/create`)
  - Suscripciones activas (`/admin/subscriptions`)
  - Facturas (`/admin/subscriptions/invoices`)
  - Pagos (`/admin/subscriptions/payments`)
  - Reembolsos (`/admin/subscriptions/refunds`)
  - Métricas: MRR, ARR, Churn Rate, LTV

##### Soporte (`/admin/support`)
- **Ícono**: HelpCircle
- **Descripción**: Sistema de tickets de soporte
- **Subsecciones**:
  - Lista de tickets (`/admin/support/tickets`)
  - Detalle de ticket (`/admin/support/tickets/[id]`)
  - Asignar tickets
  - Base de conocimiento (`/admin/support/knowledge-base`)
  - Crear artículo (`/admin/support/knowledge-base/create`)
  - Chat en vivo (`/admin/support/live-chat`)
  - Métricas de soporte

##### Reportes (`/admin/reports`)
- **Ícono**: BarChart
- **Descripción**: Reportes y análisis del sistema
- **Subsecciones**:
  - Métricas de usuarios
  - Métricas de negocio
  - Métricas de engagement
  - Reportes personalizados
  - Exportar reportes
  - Programar reportes automáticos

##### Configuración (`/admin/settings`)
- **Ícono**: Settings
- **Descripción**: Configuración global del sistema
- **Subsecciones**:
  - Configuración general
  - Categorías globales (`/admin/settings/categories`)
  - Gestión de idiomas (`/admin/settings/languages`)
  - Características del sistema (`/admin/settings/features`)
  - Modo de mantenimiento
  - Mensajes del sistema

##### Monitoreo (`/admin/monitoring`)
- **Ícono**: Activity
- **Descripción**: Monitoreo del sistema y métricas técnicas
- **Subsecciones**:
  - Métricas de rendimiento
  - Logs del sistema (`/admin/monitoring/logs`)
  - Alertas (`/admin/monitoring/alerts`)
  - Estado de servicios
  - Uso de recursos
  - Errores del sistema

##### Seguridad (`/admin/security`)
- **Ícono**: Shield
- **Descripción**: Gestión de seguridad y auditoría
- **Subsecciones**:
  - Gestión de roles (`/admin/security/roles`)
  - Permisos (`/admin/security/permissions`)
  - Auditoría (`/admin/security/audit`)
  - Sesiones activas
  - Intentos de acceso fallidos
  - Cumplimiento (GDPR, CCPA)

##### Gamificación (`/admin/gamification`)
- **Ícono**: Trophy
- **Descripción**: Gestión del sistema de gamificación
- **Subsecciones**:
  - Logros (`/admin/gamification/achievements`)
  - Desafíos (`/admin/gamification/challenges`)
  - Sistema de puntos (`/admin/gamification/points`)
  - Recompensas (`/admin/gamification/rewards`)
  - Programa de referidos (`/admin/gamification/referrals`)
  - Dashboard de métricas

##### Herramientas (`/admin/tools`)
- **Ícono**: Wrench
- **Descripción**: Herramientas de desarrollo y administración
- **Subsecciones**:
  - Base de datos (`/admin/tools/database`)
  - API y webhooks (`/admin/tools/api`)
  - Migraciones (`/admin/tools/migrations`)
  - Backups (`/admin/tools/backups`)
  - Testing (`/admin/tools/testing`)
  - Logs de desarrollo

#### 2.3 Navegación Secundaria (Header Admin)
- **Perfil de Admin**: Dropdown con:
  - Ver perfil
  - Configuración
  - Cambiar contraseña
  - Cerrar sesión
- **Notificaciones**: Alertas del sistema, tickets asignados
- **Búsqueda Global**: Buscar usuarios, grupos, tickets, etc.
- **Selector de Entorno**: Desarrollo, Staging, Producción (si aplica)
- **Indicador de Estado**: Estado del sistema (operativo, mantenimiento, etc.)

#### 2.4 Permisos por Rol

##### Super Admin
- Acceso completo a todas las secciones
- Gestión de otros administradores
- Configuración crítica del sistema

##### Admin
- Acceso a gestión de usuarios, grupos, suscripciones
- Acceso a soporte y reportes
- Sin acceso a herramientas de desarrollo críticas

##### Support Agent
- Acceso limitado a usuarios (solo lectura)
- Acceso completo a soporte
- Acceso limitado a reportes básicos

##### Developer
- Acceso a monitoreo y herramientas
- Acceso a logs y métricas técnicas
- Sin acceso a gestión de usuarios o facturación

### 3. Especificaciones Técnicas de Navegación

#### 3.1 Componentes de Navegación
- **Sidebar**: Componente reutilizable con estado colapsado/expandido
- **Breadcrumbs**: Componente de navegación contextual
- **Tabs**: Para subsecciones dentro de una página
- **Dropdown Menus**: Para acciones y opciones
- **Search Bar**: Búsqueda global con autocompletado
- **Notifications**: Sistema de notificaciones en tiempo real

#### 3.2 Estados de Navegación
- **Loading**: Skeleton loaders durante carga
- **Empty States**: Mensajes cuando no hay datos
- **Error States**: Manejo de errores con opción de reintento
- **Active State**: Indicador visual de página/sección activa

#### 3.3 Navegación Programática
- **Deep Linking**: Soporte para URLs profundas
- **Query Parameters**: Para filtros y búsquedas
- **History Management**: Navegación hacia atrás/adelante
- **Redirects**: Redirecciones automáticas según permisos

#### 3.4 Accesibilidad
- **Keyboard Navigation**: Navegación completa con teclado
- **ARIA Labels**: Etiquetas para lectores de pantalla
- **Focus Management**: Manejo adecuado del foco
- **Contrast**: Contraste adecuado para legibilidad

### 4. Flujos de Navegación Principales

#### 4.1 Flujo de Usuario Nuevo
1. Registro → Verificación de email → Dashboard → Tutorial → Primera acción

#### 4.2 Flujo de Creación de Grupo
1. Dashboard → Grupos → Crear Grupo → Invitar Miembros → Primer Gasto

#### 4.3 Flujo de Gestión de Gasto
1. Dashboard → Gastos → Crear Gasto → Seleccionar Grupo → Dividir → Guardar

#### 4.4 Flujo de Soporte
1. Dashboard → Soporte → Crear Ticket → Describir Problema → Enviar → Seguimiento

#### 4.5 Flujo Administrativo de Moderación
1. Admin Dashboard → Usuarios → Buscar Usuario → Revisar Actividad → Acción (Suspender/Activar)

### 5. Consideraciones de UX

#### 5.1 Feedback Visual
- Indicadores de carga
- Mensajes de éxito/error
- Confirmaciones para acciones destructivas
- Tooltips informativos

#### 5.2 Navegación Rápida
- Atajos de teclado
- Accesos directos frecuentes
- Búsqueda rápida
- Navegación por pestañas

#### 5.3 Responsive Design
- Menú hamburguesa en móvil
- Sidebar colapsable en tablet
- Navegación optimizada para touch
- Gestos de navegación móvil

### 6. Implementación Sugerida

#### 6.1 Estructura de Archivos
```
src/
├── components/
│   ├── navigation/
│   │   ├── UserSidebar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileMenu.tsx
│   └── ...
├── app/
│   ├── [locale]/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx (User Layout)
│   │   │   └── ...
│   │   └── admin/
│   │       ├── layout.tsx (Admin Layout)
│   │       └── ...
└── ...
```

#### 6.2 Configuración de Rutas
- Usar Next.js App Router para rutas
- Middleware para protección de rutas
- Layouts anidados para estructura jerárquica
- Metadata dinámica por página

#### 6.3 Estado de Navegación
- Context API para estado global de navegación
- Local Storage para preferencias de usuario
- Session Storage para estado temporal
- URL State para filtros y búsquedas

## Entregables Esperados

1. **Estructura de Navegación Completa**
   - Mapa de navegación visual
   - Lista de todas las rutas
   - Jerarquía de menús

2. **Componentes de Navegación**
   - Sidebar para usuario
   - Sidebar para admin
   - Breadcrumbs
   - TopBar con perfil y notificaciones
   - Menú móvil responsive

3. **Configuración de Rutas**
   - Definición de todas las rutas
   - Protección de rutas por rol
   - Redirecciones automáticas

4. **Documentación**
   - Guía de uso de navegación
   - Especificaciones de componentes
   - Flujos de usuario documentados

## Notas Adicionales

- La navegación debe ser intuitiva y consistente
- Priorizar las acciones más frecuentes
- Mantener la navegación simple pero completa
- Considerar la escalabilidad para futuras funcionalidades
- Implementar analytics para tracking de navegación
- Optimizar para performance (lazy loading, code splitting)

