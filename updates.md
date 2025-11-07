# Actualizaciones del Sistema Splitia

## 📋 Resumen de Cambios

Este documento detalla todas las actualizaciones realizadas al sistema Splitia, incluyendo el nuevo sistema de planes de suscripción y la funcionalidad de Kanban para gestión de tareas.

---

## 🎯 Sistema de Planes de Suscripción

### Descripción
Se implementó un sistema completo de planes de suscripción con tres niveles: **FREE**, **PRO** y **ENTERPRISE**, cada uno con diferentes límites y funcionalidades.

### Entidades Creadas

#### 1. Plan (`com.splitia.model.Plan`)
Nueva entidad que define las características de cada plan:
- **Límites de uso:**
  - `maxGroups`: Número máximo de grupos (FREE: 1, PRO: 10, ENTERPRISE: ilimitado)
  - `maxGroupMembers`: Miembros máximos por grupo (FREE: 5, PRO: 50, ENTERPRISE: ilimitado)
  - `maxAiRequestsPerMonth`: Solicitudes IA por mes (FREE: 10, PRO: 500, ENTERPRISE: ilimitado)
  - `maxExpensesPerGroup`: Gastos máximos por grupo (FREE: 50, PRO: 1000, ENTERPRISE: ilimitado)
  - `maxBudgetsPerGroup`: Presupuestos máximos por grupo (FREE: 3, PRO: 50, ENTERPRISE: ilimitado)

- **Funcionalidades:**
  - `hasKanban`: Acceso a tableros Kanban (solo PRO y ENTERPRISE)
  - `hasAdvancedAnalytics`: Análisis avanzados
  - `hasCustomCategories`: Categorías personalizadas
  - `hasExportData`: Exportación de datos
  - `hasPrioritySupport`: Soporte prioritario (solo ENTERPRISE)

#### 2. Actualización de Subscription
- Se agregó relación `@ManyToOne` con `Plan`
- Se mantiene compatibilidad con `planType` (enum) para migración gradual

### Servicios

#### PlanService (`com.splitia.service.PlanService`)
Servicio para gestionar planes y verificar límites:
- `getUserPlan(User user)`: Obtiene el plan activo del usuario
- `verifyKanbanAccess(User user)`: Verifica acceso a Kanban
- `verifyGroupLimit(User user, int count)`: Verifica límite de grupos
- `verifyGroupMemberLimit(User user, int count)`: Verifica límite de miembros
- `verifyAiRequestLimit(User user, int count)`: Verifica límite de IA
- `verifyExpenseLimit(User user, int count)`: Verifica límite de gastos
- `verifyBudgetLimit(User user, int count)`: Verifica límite de presupuestos
- `hasFeature(User user, String feature)`: Verifica si tiene una funcionalidad

### Migraciones

#### V3__Add_plans_table.sql
- Crea tabla `plans` con todas las características
- Agrega columna `plan_id` a `subscriptions`
- Crea índices para optimización

#### V5__Seed_plans_and_pro_users.sql
- Inserta los 3 planes (FREE, PRO, ENTERPRISE)
- Crea 3 usuarios PRO:
  - rodrigo@splitia.com
  - luis@splitia.com
  - israel@splitia.com
- Crea grupo compartido "Diseño de Software"
- Asigna suscripciones PRO a los usuarios

---

## 📊 Sistema Kanban de Tareas

### Descripción
Sistema completo de gestión de tareas tipo Kanban para grupos, disponible solo en planes PRO y ENTERPRISE.

### Entidades Creadas

#### 1. Task (`com.splitia.model.Task`)
Entidad principal para tareas:
- **Campos básicos:**
  - `title`: Título de la tarea (requerido, max 255 caracteres)
  - `description`: Descripción detallada (TEXT)
  - `status`: Estado (TODO, DOING, DONE) - enum `TaskStatus`
  - `priority`: Prioridad (LOW, MEDIUM, HIGH, URGENT)
  - `startDate`: Fecha de inicio (DATE)
  - `dueDate`: Fecha de vencimiento (DATE)
  - `position`: Posición para ordenamiento dentro de cada columna

- **Relaciones:**
  - `group`: Grupo al que pertenece (ManyToOne, requerido)
  - `assignedTo`: Usuario asignado (ManyToOne, opcional)
  - `createdBy`: Usuario creador (ManyToOne, requerido)
  - `tags`: Lista de etiquetas (ManyToMany con TaskTag)

#### 2. TaskTag (`com.splitia.model.TaskTag`)
Etiquetas para categorizar tareas:
- `name`: Nombre de la etiqueta (requerido, max 50 caracteres)
- `color`: Color en formato hex (ej: #FF5733)
- `group`: Grupo al que pertenece (ManyToOne, requerido)
- Constraint único: `(group_id, name)` - no puede haber etiquetas duplicadas por grupo

#### 3. TaskStatus (Enum)
Estados disponibles para tareas:
- `TODO`: Por hacer
- `DOING`: En progreso
- `DONE`: Completada

### Repositorios

#### TaskRepository
- `findByGroupId(UUID groupId)`: Todas las tareas de un grupo
- `findByGroupId(UUID groupId, Pageable)`: Paginado
- `findByGroupIdAndStatus(UUID groupId, TaskStatus status)`: Por estado
- `findByAssignedToId(UUID userId)`: Tareas asignadas a un usuario
- `findMaxPositionByGroupIdAndStatus()`: Máxima posición para ordenamiento

#### TaskTagRepository
- `findByGroupId(UUID groupId)`: Etiquetas de un grupo
- `findByGroupIdAndName()`: Buscar por grupo y nombre
- `existsByGroupIdAndName()`: Verificar existencia

### Servicios

#### TaskService (`com.splitia.service.TaskService`)
- `getTasksByGroup(UUID groupId, Pageable)`: Listar tareas paginadas
- `getTasksByGroupAndStatus(UUID groupId, TaskStatus status)`: Tareas por estado (para columnas Kanban)
- `getTaskById(UUID taskId)`: Obtener tarea por ID
- `createTask(CreateTaskRequest)`: Crear nueva tarea
- `updateTask(UUID taskId, UpdateTaskRequest)`: Actualizar tarea
- `softDeleteTask(UUID taskId)`: Eliminar tarea (soft delete)

**Validaciones:**
- Verifica membresía en el grupo
- Verifica acceso a Kanban según plan
- Valida que usuario asignado sea miembro del grupo
- Valida que etiquetas pertenezcan al grupo

#### TaskTagService (`com.splitia.service.TaskTagService`)
- `getTagsByGroup(UUID groupId)`: Listar etiquetas del grupo
- `getTagById(UUID tagId)`: Obtener etiqueta por ID
- `createTag(CreateTaskTagRequest)`: Crear nueva etiqueta
- `updateTag(UUID tagId, UpdateTaskTagRequest)`: Actualizar etiqueta
- `softDeleteTag(UUID tagId)`: Eliminar etiqueta (solo admins)

**Validaciones:**
- Verifica membresía en el grupo
- Verifica acceso a Kanban según plan
- Previene etiquetas duplicadas por grupo

### DTOs

#### Request DTOs
- `CreateTaskRequest`: Crear tarea
- `UpdateTaskRequest`: Actualizar tarea
- `CreateTaskTagRequest`: Crear etiqueta
- `UpdateTaskTagRequest`: Actualizar etiqueta

#### Response DTOs
- `TaskResponse`: Respuesta con información completa de tarea
- `TaskTagResponse`: Respuesta con información de etiqueta

### Controladores

#### TaskController (`/api/tasks`)
- `GET /api/tasks/group/{groupId}`: Listar tareas del grupo (paginado)
- `GET /api/tasks/group/{groupId}/status/{status}`: Tareas por estado (para Kanban)
- `GET /api/tasks/{id}`: Obtener tarea por ID
- `POST /api/tasks`: Crear nueva tarea
- `PUT /api/tasks/{id}`: Actualizar tarea
- `DELETE /api/tasks/{id}`: Eliminar tarea (soft delete)

#### TaskTagController (`/api/task-tags`)
- `GET /api/task-tags/group/{groupId}`: Listar etiquetas del grupo
- `GET /api/task-tags/{id}`: Obtener etiqueta por ID
- `POST /api/task-tags`: Crear nueva etiqueta
- `PUT /api/task-tags/{id}`: Actualizar etiqueta
- `DELETE /api/task-tags/{id}`: Eliminar etiqueta (soft delete)

### Migraciones

#### V4__Add_kanban_tasks.sql
- Crea tabla `task_tags` con constraint único por grupo
- Crea tabla `tasks` con todos los campos y relaciones
- Crea tabla de unión `task_task_tags` (many-to-many)
- Crea índices para optimización de consultas
- Agrega triggers para `updated_at`

---

## 🔄 Cambios en Modelos Existentes

### SubscriptionPlan (Enum)
- **Cambio:** `PREMIUM` → `PRO`
- Valores actuales: `FREE`, `PRO`, `ENTERPRISE`

### Subscription
- **Nuevo campo:** `plan` (ManyToOne con Plan)
- Mantiene `planType` para compatibilidad

### Group
- **Nuevas relaciones:**
  - `tasks`: Lista de tareas del grupo
  - `taskTags`: Lista de etiquetas del grupo

---

## 🔐 Control de Acceso y Validaciones

### Verificación de Plan
Todos los servicios verifican automáticamente:
1. **Membresía en grupo:** Usuario debe ser miembro del grupo
2. **Acceso a Kanban:** Plan debe tener `hasKanban = true`
3. **Límites del plan:** Se validan antes de crear recursos

### Permisos
- **Crear/Editar tareas:** Cualquier miembro del grupo
- **Eliminar tareas:** Solo creador o admin del grupo
- **Gestionar etiquetas:** Cualquier miembro puede crear, solo admins pueden eliminar

---

## 📝 Datos de Prueba (Seed)

### Planes Creados
1. **FREE**
   - Precio: $0.00
   - Grupos: 1
   - Miembros por grupo: 5
   - IA requests/mes: 10
   - Gastos por grupo: 50
   - Presupuestos por grupo: 3
   - Kanban: ❌

2. **PRO**
   - Precio: $9.99/mes
   - Grupos: 10
   - Miembros por grupo: 50
   - IA requests/mes: 500
   - Gastos por grupo: 1000
   - Presupuestos por grupo: 50
   - Kanban: ✅

3. **ENTERPRISE**
   - Precio: $29.99/mes
   - Grupos: Ilimitado
   - Miembros por grupo: Ilimitado
   - IA requests/mes: Ilimitado
   - Gastos por grupo: Ilimitado
   - Presupuestos por grupo: Ilimitado
   - Kanban: ✅
   - Soporte prioritario: ✅

### Usuarios PRO Creados
Todos con password: `splitia123`

1. **rodrigo@splitia.com**
   - Nombre: Rodrigo Splitia
   - Plan: PRO
   - Rol en grupo: ADMIN

2. **luis@splitia.com**
   - Nombre: Luis Splitia
   - Plan: PRO
   - Rol en grupo: MEMBER

3. **israel@splitia.com**
   - Nombre: Israel Splitia
   - Plan: PRO
   - Rol en grupo: MEMBER

### Grupo Compartido
- **Nombre:** Diseño de Software
- **Descripción:** Grupo compartido para el diseño y desarrollo de software
- **Creador:** rodrigo@splitia.com
- **Miembros:** Los 3 usuarios PRO

---

## 🚀 Uso del Sistema

### Para Usuarios FREE
- Pueden usar todas las funcionalidades básicas
- No tienen acceso a Kanban
- Límites reducidos en grupos, miembros, etc.

### Para Usuarios PRO
- Acceso completo a Kanban
- Límites aumentados
- Pueden crear hasta 10 grupos
- Hasta 50 miembros por grupo

### Para Usuarios ENTERPRISE
- Todo ilimitado
- Soporte prioritario
- Funcionalidades avanzadas

### Ejemplo de Uso del Kanban

```bash
# 1. Obtener tareas por estado (para columnas Kanban)
GET /api/tasks/group/{groupId}/status/TODO
GET /api/tasks/group/{groupId}/status/DOING
GET /api/tasks/group/{groupId}/status/DONE

# 2. Crear una tarea
POST /api/tasks
{
  "title": "Implementar login",
  "description": "Crear sistema de autenticación",
  "groupId": "uuid-del-grupo",
  "assignedToId": "uuid-del-usuario",
  "priority": "HIGH",
  "dueDate": "2025-12-31",
  "tagIds": ["uuid-tag-1", "uuid-tag-2"]
}

# 3. Mover tarea a otra columna
PUT /api/tasks/{taskId}
{
  "status": "DOING",
  "position": 0
}

# 4. Crear etiqueta
POST /api/task-tags
{
  "name": "Urgente",
  "color": "#FF0000",
  "groupId": "uuid-del-grupo"
}
```

---

## 📊 Estructura de Base de Datos

### Nuevas Tablas
- `plans`: Planes de suscripción
- `tasks`: Tareas del Kanban
- `task_tags`: Etiquetas de tareas
- `task_task_tags`: Tabla de unión (many-to-many)

### Tablas Modificadas
- `subscriptions`: Agregado `plan_id` (FK a plans)

---

## ⚠️ Notas Importantes

1. **Migración Gradual:** El sistema mantiene compatibilidad con `planType` (enum) mientras migra a `Plan` (entidad)

2. **Validación de Plan:** Todos los servicios verifican automáticamente el plan del usuario antes de permitir operaciones

3. **Soft Delete:** Todas las entidades nuevas soportan soft delete mediante `deletedAt`

4. **Índices:** Se crearon índices optimizados para consultas frecuentes (por grupo, estado, fecha, etc.)

5. **Constraints:** 
   - Etiquetas únicas por grupo (`unique_tag_per_group`)
   - Validación de membresía antes de asignar tareas

---

## 🔧 Próximos Pasos Recomendados

1. **Integración con Frontend:** Implementar UI de Kanban
2. **Notificaciones:** Alertas para tareas próximas a vencer
3. **Reportes:** Analytics de productividad por grupo
4. **Integraciones:** Webhooks para cambios de estado
5. **Búsqueda Avanzada:** Filtros complejos para tareas

---

## 📚 Archivos Modificados/Creados

### Nuevos Archivos
- `src/main/java/com/splitia/model/Plan.java`
- `src/main/java/com/splitia/model/Task.java`
- `src/main/java/com/splitia/model/TaskTag.java`
- `src/main/java/com/splitia/model/enums/TaskStatus.java`
- `src/main/java/com/splitia/repository/PlanRepository.java`
- `src/main/java/com/splitia/repository/TaskRepository.java`
- `src/main/java/com/splitia/repository/TaskTagRepository.java`
- `src/main/java/com/splitia/service/PlanService.java`
- `src/main/java/com/splitia/service/TaskService.java`
- `src/main/java/com/splitia/service/TaskTagService.java`
- `src/main/java/com/splitia/controller/TaskController.java`
- `src/main/java/com/splitia/controller/TaskTagController.java`
- `src/main/java/com/splitia/dto/request/CreateTaskRequest.java`
- `src/main/java/com/splitia/dto/request/UpdateTaskRequest.java`
- `src/main/java/com/splitia/dto/request/CreateTaskTagRequest.java`
- `src/main/java/com/splitia/dto/request/UpdateTaskTagRequest.java`
- `src/main/java/com/splitia/dto/response/TaskResponse.java`
- `src/main/java/com/splitia/dto/response/TaskTagResponse.java`
- `src/main/resources/db/migration/V3__Add_plans_table.sql`
- `src/main/resources/db/migration/V4__Add_kanban_tasks.sql`
- `src/main/resources/db/migration/V5__Seed_plans_and_pro_users.sql`

### Archivos Modificados
- `src/main/java/com/splitia/model/Subscription.java`
- `src/main/java/com/splitia/model/Group.java`
- `src/main/java/com/splitia/model/enums/SubscriptionPlan.java`
- `src/main/java/com/splitia/service/GroupService.java`

---

**Fecha de Actualización:** Noviembre 2025
**Versión:** 2.0.0

