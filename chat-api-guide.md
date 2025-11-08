# Guía Completa de APIs - Conversaciones, Mensajes y Chat

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

---

## 1. Conversaciones (Conversations)

### Base Path: `/api/conversations`

Las conversaciones pueden ser:
- **Chats individuales**: Entre 2 usuarios (`isGroupChat: false`)
- **Chats grupales**: Entre múltiples usuarios (`isGroupChat: true`)
- **Chats de grupo**: Automáticamente creados cuando se crea un grupo (vinculados a un `Group`)

### Obtener Conversaciones del Usuario

**GET** `/api/conversations`
- Obtiene todas las conversaciones del usuario autenticado (paginado)
- Incluye chats individuales, grupales y conversaciones de grupos donde el usuario es miembro
- Query params: `page`, `size`, `sort`

**Ejemplo:**
```typescript
// Obtener conversaciones del usuario
const getConversations = async (page: number = 0, size: number = 20) => {
  const response = await axios.get('/api/conversations', {
    params: { page, size, sort: 'createdAt,desc' }
  });
  return response.data.data; // Page<ConversationResponse>
};
```

**Response:**
```typescript
{
  success: true,
  data: {
    content: [
      {
        id: "uuid",
        isGroupChat: true,
        name: "Mi Grupo",
        participants: [
          {
            id: "uuid",
            name: "Usuario 1",
            email: "user1@example.com"
          }
        ],
        createdAt: "2024-01-15T10:30:00"
      }
    ],
    totalElements: 10,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true
  }
}
```

### Obtener Conversación por ID

**GET** `/api/conversations/{id}`
- Obtiene una conversación específica
- Solo funciona si el usuario es participante de la conversación
- Si es una conversación de grupo, el usuario debe ser miembro del grupo

**Ejemplo:**
```typescript
const getConversation = async (conversationId: string) => {
  const response = await axios.get(`/api/conversations/${conversationId}`);
  return response.data.data; // ConversationResponse
};
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    isGroupChat: true,
    name: "Mi Grupo",
    groupId: "uuid-del-grupo",  // ✅ NUEVO: ID del grupo si es conversación de grupo, null si es chat individual/grupal manual
    participants: [...],
    createdAt: "2024-01-15T10:30:00"
  }
}
```

### Crear Nueva Conversación

**POST** `/api/conversations`
- Crea una nueva conversación (individual o grupal)
- El usuario autenticado se agrega automáticamente como participante
- Si `participantIds` tiene más de 1 elemento, se crea como chat grupal

**Body:**
```typescript
{
  name?: string;              // Opcional, nombre de la conversación
  participantIds: string[];    // REQUERIDO: Array de UUIDs de participantes (mínimo 1)
}
```

**Ejemplo:**
```typescript
// Crear chat individual
const createIndividualChat = async (otherUserId: string) => {
  const response = await axios.post('/api/conversations', {
    name: null, // Opcional
    participantIds: [otherUserId] // Solo el otro usuario
  });
  return response.data.data; // ConversationResponse
};

// Crear chat grupal
const createGroupChat = async (userIds: string[], groupName: string) => {
  const response = await axios.post('/api/conversations', {
    name: groupName,
    participantIds: userIds // Múltiples usuarios
  });
  return response.data.data;
};
```

**⚠️ IMPORTANTE:** 
- El usuario autenticado se agrega automáticamente, NO incluirlo en `participantIds`
- Si incluyes tu propio ID en `participantIds`, se ignorará

### Actualizar Conversación

**PUT** `/api/conversations/{id}`
- Actualiza el nombre de la conversación
- Solo funciona si el usuario es participante

**Body:**
```typescript
{
  name?: string;  // Nuevo nombre (máximo 100 caracteres)
}
```

**Ejemplo:**
```typescript
const updateConversation = async (conversationId: string, newName: string) => {
  const response = await axios.put(`/api/conversations/${conversationId}`, {
    name: newName
  });
  return response.data.data;
};
```

### Eliminar Conversación

**DELETE** `/api/conversations/{id}`
- Elimina (soft delete) una conversación
- Solo funciona si el usuario es participante

**Ejemplo:**
```typescript
const deleteConversation = async (conversationId: string) => {
  const response = await axios.delete(`/api/conversations/${conversationId}`);
  return response.data;
};
```

---

## 2. Mensajes (Messages)

### Base Path: `/api/conversations/{conversationId}/messages`

### Enviar Mensaje

**POST** `/api/conversations/{conversationId}/messages`
- Envía un mensaje a una conversación
- El usuario debe ser participante de la conversación
- El mensaje se marca automáticamente como `isAI: false`

**Body:**
```typescript
{
  content: string;  // REQUERIDO: Contenido del mensaje (mínimo 1 carácter)
}
```

**Ejemplo:**
```typescript
const sendMessage = async (conversationId: string, content: string) => {
  const response = await axios.post(
    `/api/conversations/${conversationId}/messages`,
    { content }
  );
  return response.data.data; // MessageResponse
};
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    content: "Hola, ¿cómo estás?",
    isAI: false,
    sender: {
      id: "uuid",
      name: "Usuario Actual",
      email: "user@example.com"
    },
    createdAt: "2024-01-15T10:35:00"
  }
}
```

### Obtener Mensajes de una Conversación

**GET** `/api/conversations/{conversationId}/messages`
- Obtiene los mensajes de una conversación (paginado)
- Ordenados por fecha descendente (más recientes primero)
- El usuario debe ser participante de la conversación
- Query params: `page`, `size`, `sort`

**Ejemplo:**
```typescript
const getMessages = async (
  conversationId: string,
  page: number = 0,
  size: number = 50
) => {
  const response = await axios.get(
    `/api/conversations/${conversationId}/messages`,
    {
      params: { page, size, sort: 'createdAt,desc' }
    }
  );
  return response.data.data; // Page<MessageResponse>
};
```

**Response:**
```typescript
{
  success: true,
  data: {
    content: [
      {
        id: "uuid",
        content: "Mensaje más reciente",
        isAI: false,
        sender: {...},
        createdAt: "2024-01-15T10:35:00"
      },
      {
        id: "uuid",
        content: "Mensaje anterior",
        isAI: false,
        sender: {...},
        createdAt: "2024-01-15T10:30:00"
      }
    ],
    totalElements: 25,
    totalPages: 1,
    size: 50,
    number: 0
  }
}
```

### Actualizar Mensaje

**PUT** `/api/conversations/messages/{id}`
- Actualiza el contenido de un mensaje
- Solo funciona si el usuario es el remitente del mensaje

**Body:**
```typescript
{
  content: string;  // REQUERIDO: Nuevo contenido del mensaje
}
```

**Ejemplo:**
```typescript
const updateMessage = async (messageId: string, newContent: string) => {
  const response = await axios.put(
    `/api/conversations/messages/${messageId}`,
    { content: newContent }
  );
  return response.data.data;
};
```

### Eliminar Mensaje

**DELETE** `/api/conversations/messages/{id}`
- Elimina (soft delete) un mensaje
- Solo funciona si el usuario es el remitente del mensaje

**Ejemplo:**
```typescript
const deleteMessage = async (messageId: string) => {
  const response = await axios.delete(`/api/conversations/messages/${messageId}`);
  return response.data;
};
```

---

## 3. Conversaciones de Grupos

### Obtener Conversación de un Grupo

**✅ ACTUALIZADO:** Ahora puedes identificar conversaciones de grupo de dos formas:

**Opción 1: Desde GroupResponse (Recomendado)**

Cuando obtienes un grupo, ahora incluye el `conversationId`:

```typescript
// Obtener grupo
const getGroup = async (groupId: string) => {
  const response = await axios.get(`/api/groups/${groupId}`);
  const group = response.data.data;
  
  // ✅ group.conversationId contiene el ID de la conversación
  return group.conversationId;
};

// Luego obtener la conversación
const getGroupConversation = async (groupId: string) => {
  const group = await getGroup(groupId);
  const conversation = await axios.get(`/api/conversations/${group.conversationId}`);
  return conversation.data.data;
};
```

**Opción 2: Filtrar desde la lista de conversaciones**

```typescript
// Obtener todas las conversaciones y filtrar por grupo
const getGroupConversation = async (groupId: string) => {
  const conversations = await axios.get('/api/conversations', {
    params: { page: 0, size: 100 }
  });
  
  // ✅ Ahora ConversationResponse incluye groupId
  const groupConversation = conversations.data.data.content.find(
    conv => conv.groupId === groupId
  );
  
  if (!groupConversation) {
    throw new Error('Conversation not found for this group');
  }
  
  return groupConversation;
};
```

**Opción 3: Endpoint directo (Recomendado para implementar)**

Para facilitar aún más el acceso, puedes agregar este endpoint al `ChatController`:

```java
@GetMapping("/group/{groupId}")
public ResponseEntity<ApiResponse<ConversationResponse>> getConversationByGroupId(
    @PathVariable UUID groupId) {
    ConversationResponse conversation = chatService.getConversationByGroupId(groupId);
    return ResponseEntity.ok(ApiResponse.success(conversation));
}
```

### Solución Recomendada: Agregar Endpoint

Para solucionar el error 400 y facilitar el acceso a conversaciones de grupos, se recomienda agregar:

**GET** `/api/conversations/group/{groupId}`
- Obtiene la conversación asociada a un grupo
- Solo funciona si el usuario es miembro del grupo

**Implementación sugerida en `ChatService.java`:**

```java
public ConversationResponse getConversationByGroupId(UUID groupId) {
    User currentUser = getCurrentUser();
    
    // Verificar que el usuario es miembro del grupo
    Group group = groupRepository.findByIdAndDeletedAtIsNull(groupId)
        .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
    
    if (!groupUserRepository.existsByUserIdAndGroupId(currentUser.getId(), groupId)) {
        throw new ForbiddenException("You are not a member of this group");
    }
    
    Conversation conversation = conversationRepository.findByGroupId(groupId)
        .orElseThrow(() -> new ResourceNotFoundException("Conversation", "groupId", groupId));
    
    return conversationMapper.toResponse(conversation);
}
```

**Y en `ChatController.java`:**

```java
@GetMapping("/group/{groupId}")
@Operation(summary = "Get conversation by group ID")
public ResponseEntity<ApiResponse<ConversationResponse>> getConversationByGroupId(
    @PathVariable UUID groupId) {
    ConversationResponse conversation = chatService.getConversationByGroupId(groupId);
    return ResponseEntity.ok(ApiResponse.success(conversation));
}
```

---

## 4. Chat con IA

### Base Path: `/api/ai`

### Procesar Mensaje con IA

**POST** `/api/ai/process-message`
- Procesa un mensaje con IA
- ⚠️ **ACTUALMENTE NO IMPLEMENTADO** - Lanza `UnsupportedOperationException`

**Body:**
```typescript
string  // Mensaje como string plano
```

**Ejemplo:**
```typescript
const processWithAI = async (message: string) => {
  try {
    const response = await axios.post('/api/ai/process-message', message, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    return response.data;
  } catch (error) {
    // Actualmente lanzará error 500 - Not yet implemented
    console.error('AI service not implemented yet');
  }
};
```

**⚠️ NOTA:** Este endpoint está marcado como "Not yet implemented" en el código. Necesitarás implementar la integración con el servicio de IA.

---

## 5. Solución al Error 400

### Problema Común: "Failed to load resource: the server responded with a status of 400"

El error 400 generalmente ocurre por:

1. **Falta de campos requeridos en la request**
   - `participantIds` es requerido y debe ser un array no vacío
   - `content` en mensajes es requerido y no puede estar vacío

2. **Validación fallida**
   - `name` de conversación debe tener máximo 100 caracteres
   - `content` de mensaje debe tener mínimo 1 carácter

3. **Usuario no es participante**
   - Intentar acceder a una conversación donde el usuario no es participante
   - Intentar enviar mensaje a una conversación donde el usuario no es participante

### Ejemplo de Request Correcta

```typescript
// ✅ CORRECTO: Crear conversación
const createConversation = async () => {
  const response = await axios.post('/api/conversations', {
    name: 'Mi Chat',  // Opcional
    participantIds: ['uuid-del-otro-usuario']  // REQUERIDO: Array no vacío
  });
  return response.data;
};

// ❌ INCORRECTO: Falta participantIds
const wrongRequest = async () => {
  const response = await axios.post('/api/conversations', {
    name: 'Mi Chat'
    // Falta participantIds - Error 400
  });
};

// ❌ INCORRECTO: participantIds vacío
const wrongRequest2 = async () => {
  const response = await axios.post('/api/conversations', {
    participantIds: []  // Array vacío - Error 400
  });
};
```

### Ejemplo de Request Correcta para Mensajes

```typescript
// ✅ CORRECTO: Enviar mensaje
const sendMessage = async (conversationId: string) => {
  const response = await axios.post(
    `/api/conversations/${conversationId}/messages`,
    {
      content: 'Hola!'  // REQUERIDO: String no vacío
    }
  );
  return response.data;
};

// ❌ INCORRECTO: Content vacío o faltante
const wrongMessage = async (conversationId: string) => {
  const response = await axios.post(
    `/api/conversations/${conversationId}/messages`,
    {
      content: ''  // String vacío - Error 400
    }
  );
};
```

---

## 6. Flujo Completo de Uso

### Flujo 1: Crear Chat Individual

```typescript
// 1. Crear conversación con otro usuario
const createChat = async (otherUserId: string) => {
  const conversation = await axios.post('/api/conversations', {
    participantIds: [otherUserId]
  });
  
  return conversation.data.data.id; // conversationId
};

// 2. Enviar mensaje
const sendFirstMessage = async (conversationId: string) => {
  await axios.post(`/api/conversations/${conversationId}/messages`, {
    content: 'Hola!'
  });
};

// 3. Obtener mensajes
const getChatMessages = async (conversationId: string) => {
  const messages = await axios.get(
    `/api/conversations/${conversationId}/messages`,
    { params: { page: 0, size: 50 } }
  );
  return messages.data.data.content;
};
```

### Flujo 2: Usar Chat de Grupo

```typescript
// 1. Obtener conversación del grupo (requiere endpoint adicional)
const getGroupChat = async (groupId: string) => {
  // Opción A: Si existe endpoint /api/conversations/group/{groupId}
  const conversation = await axios.get(`/api/conversations/group/${groupId}`);
  return conversation.data.data;
  
  // Opción B: Filtrar desde lista de conversaciones
  const allConversations = await axios.get('/api/conversations', {
    params: { page: 0, size: 100 }
  });
  
  // Buscar conversación que tenga groupId asociado
  // Nota: Requiere que ConversationResponse incluya groupId
  return allConversations.data.data.content.find(
    conv => conv.groupId === groupId
  );
};

// 2. Enviar mensaje al grupo
const sendGroupMessage = async (conversationId: string, message: string) => {
  await axios.post(`/api/conversations/${conversationId}/messages`, {
    content: message
  });
};

// 3. Obtener mensajes del grupo
const getGroupMessages = async (conversationId: string) => {
  const messages = await axios.get(
    `/api/conversations/${conversationId}/messages`,
    { params: { page: 0, size: 50 } }
  );
  return messages.data.data.content;
};
```

### Flujo 3: Crear Chat Grupal Manual

```typescript
// Crear chat grupal con múltiples usuarios
const createGroupChat = async (userIds: string[], groupName: string) => {
  const conversation = await axios.post('/api/conversations', {
    name: groupName,
    participantIds: userIds  // Array con múltiples UUIDs
  });
  
  return conversation.data.data;
};
```

---

## 7. Tipos TypeScript

```typescript
// Request Types
interface CreateConversationRequest {
  name?: string;
  participantIds: string[];  // REQUERIDO: Mínimo 1 elemento
}

interface UpdateConversationRequest {
  name?: string;  // Máximo 100 caracteres
}

interface SendMessageRequest {
  content: string;  // REQUERIDO: Mínimo 1 carácter
}

interface UpdateMessageRequest {
  content: string;  // REQUERIDO: Mínimo 1 carácter
}

// Response Types
interface ConversationResponse {
  id: string;
  isGroupChat: boolean;
  name: string | null;
  groupId: string | null;  // ✅ NUEVO: ID del grupo si es conversación de grupo, null si es chat individual/grupal manual
  participants: UserResponse[];
  createdAt: string;
}

interface MessageResponse {
  id: string;
  content: string;
  isAI: boolean;
  sender: UserResponse;
  createdAt: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  // ... otros campos
}
```

---

## 8. Ejemplos Completos con Axios

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
    if (error.response?.status === 400) {
      console.error('Bad Request:', error.response.data);
      // Mostrar mensaje de error al usuario
    }
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Funciones Helper

```typescript
// Conversaciones
export const conversationApi = {
  // Obtener todas las conversaciones
  getAll: async (page: number = 0, size: number = 20) => {
    const response = await apiClient.get('/conversations', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data.data;
  },
  
  // Obtener conversación por ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data.data;
  },
  
  // Crear conversación
  create: async (data: CreateConversationRequest) => {
    const response = await apiClient.post('/conversations', data);
    return response.data.data;
  },
  
  // Actualizar conversación
  update: async (id: string, data: UpdateConversationRequest) => {
    const response = await apiClient.put(`/conversations/${id}`, data);
    return response.data.data;
  },
  
  // Eliminar conversación
  delete: async (id: string) => {
    const response = await apiClient.delete(`/conversations/${id}`);
    return response.data;
  }
};

// Mensajes
export const messageApi = {
  // Enviar mensaje
  send: async (conversationId: string, content: string) => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data.data;
  },
  
  // Obtener mensajes
  getByConversation: async (
    conversationId: string,
    page: number = 0,
    size: number = 50
  ) => {
    const response = await apiClient.get(
      `/conversations/${conversationId}/messages`,
      { params: { page, size, sort: 'createdAt,desc' } }
    );
    return response.data.data;
  },
  
  // Actualizar mensaje
  update: async (messageId: string, content: string) => {
    const response = await apiClient.put(
      `/conversations/messages/${messageId}`,
      { content }
    );
    return response.data.data;
  },
  
  // Eliminar mensaje
  delete: async (messageId: string) => {
    const response = await apiClient.delete(
      `/conversations/messages/${messageId}`
    );
    return response.data;
  }
};
```

---

## 9. Notas Importantes

1. **Autenticación**: Todas las rutas requieren token JWT en el header `Authorization`

2. **Participantes**: El usuario autenticado se agrega automáticamente como participante al crear una conversación

3. **Permisos**: 
   - Solo puedes acceder a conversaciones donde eres participante
   - Solo puedes editar/eliminar tus propios mensajes
   - Solo puedes actualizar conversaciones donde eres participante

4. **Chats de Grupo**: 
   - Se crean automáticamente al crear un grupo
   - Todos los miembros del grupo son participantes automáticamente
   - ✅ **ACTUALIZADO**: `ConversationResponse` ahora incluye `groupId` para identificar conversaciones de grupo
   - ✅ **ACTUALIZADO**: `GroupResponse` ahora incluye `conversationId` para obtener la conversación desde el grupo

5. **Paginación**: 
   - Los mensajes se ordenan por `createdAt DESC` (más recientes primero)
   - Usa paginación para cargar mensajes históricos

6. **Soft Delete**: 
   - Las conversaciones y mensajes usan soft delete
   - Los elementos eliminados no aparecen en las consultas normales

---

## 10. Endpoints Faltantes Recomendados

Para mejorar la funcionalidad, se recomienda agregar:

1. **GET** `/api/conversations/group/{groupId}` - Obtener conversación por groupId
2. **POST** `/api/conversations/{id}/participants` - Agregar participante a conversación
3. **DELETE** `/api/conversations/{id}/participants/{userId}` - Remover participante
4. **GET** `/api/conversations/{id}/participants` - Listar participantes
5. **POST** `/api/conversations/{id}/read` - Marcar conversación como leída
6. **GET** `/api/conversations/unread` - Obtener conversaciones no leídas

---

## 11. Solución al Error Específico

Si estás obteniendo error 400 al intentar cargar la conversación del grupo, verifica:

1. **¿Estás enviando los parámetros correctos?**
   ```typescript
   // ✅ Correcto
   GET /api/conversations/{conversationId}
   
   // ❌ Incorrecto - Falta el ID
   GET /api/conversations
   ```

2. **¿El usuario es miembro del grupo?**
   - Verifica que el usuario esté en la tabla `group_users`
   - Verifica que el usuario tenga acceso a la conversación

3. **¿La conversación existe?**
   - Verifica que el grupo tenga una conversación asociada
   - Si no existe, créala manualmente o verifica que se creó al crear el grupo

4. **¿Estás usando el conversationId correcto?**
   - Obtén el conversationId desde la respuesta del grupo
   - O usa el endpoint sugerido `/api/conversations/group/{groupId}`

### Código de Ejemplo para Obtener Conversación de Grupo

```typescript
// ✅ OPCIÓN 1: Desde GroupResponse (Más eficiente)
const getGroupConversation = async (groupId: string) => {
  // Obtener grupo que incluye conversationId
  const groupResponse = await axios.get(`/api/groups/${groupId}`);
  const conversationId = groupResponse.data.data.conversationId;
  
  // Obtener conversación
  const conversationResponse = await axios.get(`/api/conversations/${conversationId}`);
  return conversationResponse.data.data;
};

// ✅ OPCIÓN 2: Filtrar desde lista de conversaciones
const getGroupConversationFromList = async (groupId: string) => {
  const allConversations = await axios.get('/api/conversations', {
    params: { page: 0, size: 100 }
  });
  
  // Buscar conversación del grupo usando groupId
  const groupConversation = allConversations.data.data.content.find(
    conv => conv.groupId === groupId
  );
  
  if (!groupConversation) {
    throw new Error('Conversation not found for this group');
  }
  
  return groupConversation;
};

// ✅ OPCIÓN 3: Si existe endpoint directo (requiere implementación)
const getGroupConversationDirect = async (groupId: string) => {
  const response = await axios.get(`/api/conversations/group/${groupId}`);
  return response.data.data;
};
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Requiere Participante |
|--------|----------|-------------|----------------------|
| GET | `/api/conversations` | Listar conversaciones del usuario | - |
| GET | `/api/conversations/{id}` | Obtener conversación por ID | ✅ |
| POST | `/api/conversations` | Crear nueva conversación | - |
| PUT | `/api/conversations/{id}` | Actualizar conversación | ✅ |
| DELETE | `/api/conversations/{id}` | Eliminar conversación | ✅ |
| POST | `/api/conversations/{id}/messages` | Enviar mensaje | ✅ |
| GET | `/api/conversations/{id}/messages` | Obtener mensajes | ✅ |
| PUT | `/api/conversations/messages/{id}` | Actualizar mensaje | ✅ (propio) |
| DELETE | `/api/conversations/messages/{id}` | Eliminar mensaje | ✅ (propio) |
| POST | `/api/ai/process-message` | Procesar con IA | - |

---

**Última actualización:** 2024-01-15

