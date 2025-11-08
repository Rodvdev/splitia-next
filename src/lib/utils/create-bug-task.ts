/**
 * Utilidad para crear la tarea de bug sobre el botón "Dividir Igualmente"
 * 
 * Uso en consola del navegador:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este código completo
 * 3. Ejecuta: createBugTaskFromBrowser('tu-group-id')
 * 
 * Para obtener el groupId:
 * - Ve a la página de un grupo: /dashboard/groups/[id]
 * - El ID está en la URL
 * - O ejecuta: window.location.pathname.split('/').pop()
 */

import { tasksApi } from '@/lib/api/tasks';
import { CreateTaskRequest } from '@/types';

export async function createBugTaskFromBrowser(groupId: string) {
  if (!groupId) {
    console.error('❌ Por favor proporciona un groupId');
    console.log('💡 Puedes obtener el groupId desde la URL cuando estás en la página de un grupo');
    console.log('💡 Ejemplo: Si la URL es /dashboard/groups/123, el groupId es "123"');
    return null;
  }

  const request: CreateTaskRequest = {
    title: 'No funciona el boton para dividir igualmente',
    description: `El botón "Dividir Igualmente" en el formulario de creación de tareas no está funcionando correctamente.

Problema:
- Al hacer clic en el botón "Dividir Igualmente", no se están creando las participaciones iguales para todos los miembros del grupo
- El botón parece estar deshabilitado o no responde al hacer clic

Pasos para reproducir:
1. Ir a crear una nueva tarea
2. Seleccionar modo de gasto futuro (crear o almacenar)
3. Ingresar un monto
4. Hacer clic en "Dividir Igualmente"
5. Las participaciones no se crean automáticamente

Ubicación:
- Componente: CreateTaskDialog.tsx
- Función: calculateEqualShares()
- Línea aproximada: 126-139`,
    groupId,
    priority: 'HIGH',
  };

  try {
    const response = await tasksApi.createTask(request);
    if (response.success) {
      console.log('✅ Tarea creada exitosamente!');
      console.log('📋 Título:', response.data.title);
      console.log('🆔 ID:', response.data.id);
      console.log('📍 Estado:', response.data.status);
      console.log('🎯 Prioridad:', response.data.priority);
      return response.data;
    } else {
      console.error('❌ Error al crear la tarea:', response);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error al crear la tarea:', error);
    console.log('💡 Asegúrate de estar autenticado y tener permisos para crear tareas en este grupo');
    return null;
  }
}

// Función helper para obtener el groupId desde la URL actual
export function getGroupIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const path = window.location.pathname;
  const match = path.match(/\/groups\/([^\/]+)/);
  return match ? match[1] : null;
}

// Función que intenta crear la tarea automáticamente usando el groupId de la URL
export async function createBugTaskAuto() {
  const groupId = getGroupIdFromUrl();
  
  if (!groupId) {
    console.error('❌ No se pudo obtener el groupId de la URL');
    console.log('💡 Asegúrate de estar en la página de un grupo: /dashboard/groups/[id]');
    console.log('💡 O proporciona el groupId manualmente: createBugTaskFromBrowser("tu-group-id")');
    return null;
  }
  
  console.log('🔍 GroupId detectado:', groupId);
  return createBugTaskFromBrowser(groupId);
}

