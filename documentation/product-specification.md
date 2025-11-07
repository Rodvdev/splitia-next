# Prompt Completo: Estructura y Rutas de Splitia Next.js

## Contexto
Crear una aplicación Next.js 16+ completa con App Router que se conecte a la API de Splitia en `http://localhost:8080/api`. La aplicación debe incluir todas las rutas, componentes, servicios, hooks y tipos TypeScript basados en la API REST del backend.

## Configuración Base

### 1. Variables de Entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Estructura de Carpetas Completa

```
splitia-next/
├── src/
│   ├── app/                          # App Router (Next.js 14+)
│   │   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/             # Grupo de rutas protegidas
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── groups/
│   │   │   │   ├── page.tsx         # Lista de grupos
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Crear grupo
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # Detalle del grupo
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx # Editar grupo
│   │   │   │       └── members/
│   │   │   │           └── page.tsx # Gestionar miembros
│   │   │   ├── expenses/
│   │   │   │   ├── page.tsx         # Lista de gastos
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Crear gasto
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalle del gasto
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Editar gasto
│   │   │   ├── budgets/
│   │   │   │   ├── page.tsx          # Lista de presupuestos
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Crear presupuesto
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalle del presupuesto
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Editar presupuesto
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx          # Lista de conversaciones
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx      # Chat individual/grupal
│   │   │   ├── settlements/
│   │   │   │   ├── page.tsx          # Lista de settlements
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detalle del settlement
│   │   │   ├── subscriptions/
│   │   │   │   ├── page.tsx          # Gestión de suscripción
│   │   │   │   └── plans/
│   │   │   │       └── page.tsx      # Ver planes disponibles
│   │   │   ├── support/
│   │   │   │   ├── page.tsx          # Lista de tickets
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Crear ticket
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detalle del ticket
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx          # Perfil del usuario
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx     # Editar perfil
│   │   │   │   ├── preferences/
│   │   │   │   │   └── page.tsx     # Preferencias
│   │   │   │   └── password/
│   │   │   │       └── page.tsx     # Cambiar contraseña
│   │   │   ├── categories/
│   │   │   │   └── page.tsx          # Gestión de categorías
│   │   │   ├── admin/                # Solo para admins
│   │   │   │   ├── page.tsx          # Dashboard admin
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx      # Gestión de usuarios
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx      # Configuración admin
│   │   │   └── layout.tsx            # Layout con sidebar/navbar
│   │   ├── api/                      # API Routes (opcional, para proxy)
│   │   │   └── proxy/
│   │   │       └── [...path]/
│   │   │           └── route.ts
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home page (redirect a dashboard o login)
│   │   ├── loading.tsx                # Loading UI
│   │   ├── error.tsx                  # Error boundary
│   │   └── not-found.tsx              # 404 page
│   ├── components/                    # Componentes reutilizables
│   │   ├── ui/                        # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── layout/                    # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/                      # Componentes de autenticación
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── groups/                    # Componentes de grupos
│   │   │   ├── GroupCard.tsx
│   │   │   ├── GroupList.tsx
│   │   │   ├── GroupForm.tsx
│   │   │   ├── MemberList.tsx
│   │   │   └── InviteMember.tsx
│   │   ├── expenses/                  # Componentes de gastos
│   │   │   ├── ExpenseCard.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseShareEditor.tsx
│   │   │   └── ExpenseFilters.tsx
│   │   ├── budgets/                   # Componentes de presupuestos
│   │   │   ├── BudgetCard.tsx
│   │   │   ├── BudgetList.tsx
│   │   │   ├── BudgetForm.tsx
│   │   │   └── BudgetChart.tsx
│   │   ├── chat/                      # Componentes de chat
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ConversationList.tsx
│   │   ├── settlements/                # Componentes de settlements
│   │   │   ├── SettlementCard.tsx
│   │   │   ├── SettlementList.tsx
│   │   │   └── SettlementForm.tsx
│   │   ├── subscriptions/              # Componentes de suscripciones
│   │   │   ├── SubscriptionCard.tsx
│   │   │   ├── PlanSelector.tsx
│   │   │   └── BillingInfo.tsx
│   │   ├── support/                    # Componentes de soporte
│   │   │   ├── TicketCard.tsx
│   │   │   ├── TicketList.tsx
│   │   │   └── TicketForm.tsx
│   │   ├── profile/                    # Componentes de perfil
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── PreferencesForm.tsx
│   │   └── common/                     # Componentes comunes
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Pagination.tsx
│   │       └── SearchBar.tsx
│   ├── lib/                           # Utilidades y configuraciones
│   │   ├── api/                       # Cliente API
│   │   │   ├── client.ts              # Cliente axios/fetch configurado
│   │   │   ├── auth.ts                # Endpoints de autenticación
│   │   │   ├── users.ts               # Endpoints de usuarios
│   │   │   ├── groups.ts              # Endpoints de grupos
│   │   │   ├── expenses.ts            # Endpoints de gastos
│   │   │   ├── budgets.ts            # Endpoints de presupuestos
│   │   │   ├── categories.ts         # Endpoints de categorías
│   │   │   ├── chat.ts               # Endpoints de chat
│   │   │   ├── settlements.ts        # Endpoints de settlements
│   │   │   ├── subscriptions.ts      # Endpoints de suscripciones
│   │   │   ├── support.ts            # Endpoints de soporte
│   │   │   ├── ai.ts                 # Endpoints de IA
│   │   │   └── admin.ts             # Endpoints de admin
│   │   ├── auth/                      # Utilidades de autenticación
│   │   │   ├── token.ts              # Manejo de tokens JWT
│   │   │   ├── storage.ts            # LocalStorage/SessionStorage
│   │   │   └── middleware.ts         # Middleware de auth
│   │   ├── utils/                     # Utilidades generales
│   │   │   ├── format.ts             # Formateo de fechas, monedas
│   │   │   ├── validation.ts          # Validaciones
│   │   │   ├── constants.ts          # Constantes
│   │   │   └── helpers.ts            # Funciones helper
│   │   └── hooks/                     # Custom hooks
│   │       ├── useAuth.ts             # Hook de autenticación
│   │       ├── useApi.ts              # Hook genérico para llamadas API
│   │       ├── useGroups.ts           # Hook para grupos
│   │       ├── useExpenses.ts         # Hook para gastos
│   │       ├── useBudgets.ts          # Hook para presupuestos
│   │       ├── useChat.ts             # Hook para chat
│   │       └── useDebounce.ts         # Hook de debounce
│   ├── types/                         # Tipos TypeScript
│   │   ├── api/                       # Tipos de la API
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── group.ts
│   │   │   ├── expense.ts
│   │   │   ├── budget.ts
│   │   │   ├── category.ts
│   │   │   ├── message.ts
│   │   │   ├── settlement.ts
│   │   │   ├── subscription.ts
│   │   │   ├── support.ts
│   │   │   └── common.ts             # ApiResponse, Pageable, etc.
│   │   └── index.ts                   # Exportaciones de tipos
│   ├── contexts/                      # React Contexts
│   │   ├── AuthContext.tsx            # Context de autenticación
│   │   ├── ThemeContext.tsx           # Context de tema (opcional)
│   │   └── NotificationContext.tsx    # Context de notificaciones
│   ├── store/                         # Estado global (Zustand/Redux opcional)
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   └── styles/                        # Estilos globales
│       ├── globals.css
│       └── variables.css
├── public/                             # Archivos estáticos
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── .env.local                          # Variables de entorno
├── .env.example                       # Ejemplo de variables
├── next.config.ts                      # Configuración de Next.js
├── tailwind.config.ts                  # Configuración de Tailwind
├── tsconfig.json                       # Configuración de TypeScript
└── package.json                        # Dependencias
```

## Endpoints de la API a Implementar

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Usuario actual

### Usuarios (`/api/users`)
- `GET /api/users/me` - Obtener perfil
- `PUT /api/users/me` - Actualizar perfil
- `PUT /api/users/me/password` - Cambiar contraseña
- `PUT /api/users/me/preferences` - Actualizar preferencias

### Grupos (`/api/groups`)
- `GET /api/groups` - Listar grupos del usuario
- `POST /api/groups` - Crear grupo
- `GET /api/groups/{id}` - Obtener grupo
- `PUT /api/groups/{id}` - Actualizar grupo
- `DELETE /api/groups/{id}` - Eliminar grupo
- `POST /api/groups/{id}/members?userId={userId}` - Agregar miembro
- `DELETE /api/groups/{id}/members/{userId}` - Remover miembro

### Gastos (`/api/expenses`)
- `GET /api/expenses?groupId={groupId}&pageable={...}` - Listar gastos
- `POST /api/expenses` - Crear gasto
- `GET /api/expenses/{id}` - Obtener gasto
- `PUT /api/expenses/{id}` - Actualizar gasto
- `DELETE /api/expenses/{id}` - Eliminar gasto

### Presupuestos (`/api/budgets`)
- `GET /api/budgets` - Listar presupuestos
- `POST /api/budgets` - Crear presupuesto
- `GET /api/budgets/{id}` - Obtener presupuesto
- `PUT /api/budgets/{id}` - Actualizar presupuesto
- `DELETE /api/budgets/{id}` - Eliminar presupuesto

### Categorías (`/api/categories`)
- `GET /api/categories` - Listar categorías del usuario

### Chat (`/api/conversations`)
- `GET /api/conversations/{conversationId}/messages?pageable={...}` - Obtener mensajes
- `POST /api/conversations/{conversationId}/messages` - Enviar mensaje

### Settlements (`/api/settlements`)
- `GET /api/settlements` - Listar settlements
- `POST /api/settlements` - Crear settlement
- `GET /api/settlements/{id}` - Obtener settlement

### Subscriptions (`/api/subscriptions`)
- `GET /api/subscriptions/current` - Obtener suscripción actual

### Support (`/api/support`)
- `GET /api/support/tickets` - Listar tickets
- `POST /api/support/tickets` - Crear ticket
- `GET /api/support/tickets/{id}` - Obtener ticket

### AI (`/api/ai`)
- `POST /api/ai/process-message` - Procesar mensaje con IA

### Admin (`/api/admin`)
- `GET /api/admin/users` - Listar todos los usuarios (solo admin)

## Tipos TypeScript a Crear

Basados en los DTOs del backend:

```typescript
// types/api/common.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// types/api/auth.ts
export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

// types/api/user.ts
export interface UserResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  currency: string;
  language: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  image?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesRequest {
  currency?: string;
  language?: string;
}

// types/api/group.ts
export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdBy: UserResponse;
  members: GroupMemberResponse[];
  createdAt: string;
}

export interface GroupMemberResponse {
  id: string;
  user: UserResponse;
  role: 'ADMIN' | 'MEMBER' | 'GUEST' | 'ASSISTANT';
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  image?: string;
}

// types/api/expense.ts
export interface ExpenseResponse {
  id: string;
  amount: number;
  description: string;
  date: string;
  currency: string;
  location?: string;
  notes?: string;
  isSettlement: boolean;
  paidBy: UserResponse;
  group?: GroupResponse;
  category?: CategoryResponse;
  shares: ExpenseShareResponse[];
  createdAt: string;
}

export interface ExpenseShareResponse {
  id: string;
  amount: number;
  type: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
  user: UserResponse;
}

export interface ExpenseShareRequest {
  userId: string;
  amount: number;
  type: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  date: string;
  currency?: string;
  location?: string;
  notes?: string;
  groupId?: string;
  categoryId?: string;
  paidById: string;
  shares: ExpenseShareRequest[];
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  date?: string;
  currency?: string;
  location?: string;
  notes?: string;
  categoryId?: string;
  shares?: ExpenseShareRequest[];
}

// types/api/budget.ts
export interface BudgetResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  currency: string;
  category?: CategoryResponse;
  createdAt: string;
}

export interface CreateBudgetRequest {
  amount: number;
  month: number;
  year: number;
  currency?: string;
  categoryId?: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  currency?: string;
}

// types/api/category.ts
export interface CategoryResponse {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

// types/api/message.ts
export interface MessageResponse {
  id: string;
  content: string;
  isAI: boolean;
  sender: UserResponse;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

// types/api/settlement.ts
export interface SettlementResponse {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: 'PAYMENT' | 'RECEIPT';
  initiatedBy: UserResponse;
  settledWithUser: UserResponse;
  createdAt: string;
}

export interface CreateSettlementRequest {
  amount: number;
  currency: string;
  description?: string;
  userId: string;
  type: 'PAYMENT' | 'RECEIPT';
}

// types/api/subscription.ts
export interface SubscriptionResponse {
  id: string;
  planType: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  pricePerMonth: number;
  currency: string;
  createdAt: string;
}

// types/api/support.ts
export interface SupportTicketResponse {
  id: string;
  title: string;
  description: string;
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'ACCOUNT' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolvedAt?: string;
  createdBy: UserResponse;
  assignedTo?: UserResponse;
  createdAt: string;
}

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'ACCOUNT' | 'GENERAL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}
```

## Funcionalidades Clave a Implementar

### 1. Autenticación
- Login/Register con validación de formularios
- Manejo de tokens JWT (access + refresh)
- Refresh automático de tokens
- Protección de rutas con middleware
- Logout y limpieza de sesión

### 2. Dashboard
- Vista general con estadísticas
- Resumen de grupos activos
- Gastos recientes
- Presupuestos del mes
- Balances pendientes

### 3. Grupos
- Lista de grupos con búsqueda/filtros
- Crear/editar grupos
- Gestionar miembros (agregar/remover)
- Roles y permisos
- Invitaciones

### 4. Gastos
- Lista paginada de gastos
- Crear gasto con distribución de shares
- Editar/eliminar gastos
- Filtros por grupo, fecha, categoría
- Visualización de balances

### 5. Presupuestos
- Lista de presupuestos mensuales
- Crear/editar presupuestos
- Gráficos de seguimiento
- Alertas de exceso

### 6. Chat
- Lista de conversaciones
- Chat en tiempo real (WebSocket o polling)
- Mensajes de IA integrados
- Notificaciones de nuevos mensajes

### 7. Settlements
- Lista de settlements pendientes
- Crear settlement
- Confirmar/completar settlements
- Historial

### 8. Perfil
- Editar información personal
- Cambiar contraseña
- Preferencias (moneda, idioma)
- Avatar

### 9. Soporte
- Crear tickets de soporte
- Ver historial de tickets
- Seguimiento de estado

### 10. Suscripciones
- Ver plan actual
- Cambiar de plan
- Historial de pagos

## Tecnologías Recomendadas

- **UI Framework**: shadcn/ui + Tailwind CSS
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand o React Query
- **HTTP Client**: Axios o fetch nativo
- **Notificaciones**: react-hot-toast o sonner
- **Gráficos**: Recharts o Chart.js
- **Iconos**: Lucide React
- **Fecha**: date-fns
- **Validación**: Zod

## Instrucciones de Implementación

1. **Instalar dependencias base**:
```bash
npm install axios zustand react-hook-form @hookform/resolvers zod date-fns recharts lucide-react
npm install -D @types/node
```

2. **Configurar shadcn/ui**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog form label select table toast avatar badge
```

3. **Crear estructura de carpetas** siguiendo el árbol de directorios arriba

4. **Implementar cliente API** con interceptores para tokens

5. **Crear todos los tipos TypeScript** basados en los DTOs

6. **Implementar hooks personalizados** para cada entidad

7. **Crear componentes UI** reutilizables

8. **Implementar todas las páginas** con sus formularios y validaciones

9. **Configurar middleware** para protección de rutas

10. **Implementar manejo de errores** global

11. **Agregar loading states** y skeletons

12. **Implementar paginación** donde sea necesario

13. **Agregar búsqueda y filtros** en listas

14. **Implementar notificaciones** para acciones del usuario

15. **Agregar responsive design** para móviles

## Notas Importantes

- Todas las llamadas API deben incluir el token JWT en el header `Authorization: Bearer {token}`
- Manejar errores 401 para redirigir al login
- Implementar refresh automático de tokens
- Usar React Query o SWR para cache y sincronización
- Implementar optimistic updates donde sea apropiado
- Agregar validación tanto en cliente como servidor
- Implementar loading states y error boundaries
- Usar TypeScript estricto
- Seguir las convenciones de Next.js 14+ App Router
- Implementar SEO básico con metadata
- Agregar tests básicos con Jest/React Testing Library

