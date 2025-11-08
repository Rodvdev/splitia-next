/**
 * Script para crear una tarea de bug en el kanban
 * 
 * Uso:
 * 1. Ejecutar en la consola del navegador después de importar las funciones necesarias
 * 2. O usar como función de utilidad en el código
 * 
 * Ejemplo de uso en consola:
 * ```javascript
 * // Primero necesitas obtener el groupId de uno de tus grupos
 * // Luego ejecutar:
 * createBugTask('tu-group-id-aqui', 'No funciona el boton para dividir igualmente')
 * ```
 */

import { tasksApi } from '@/lib/api/tasks';
import { CreateTaskRequest } from '@/types';

export async function createBugTask(
  groupId: string,
  title: string = 'No funciona el boton para dividir igualmente',
  description?: string
) {
  const request: CreateTaskRequest = {
    title,
    description: description || 'El botón "Dividir Igualmente" en el formulario de creación de tareas no está funcionando correctamente.',
    groupId,
    priority: 'HIGH',
  };

  try {
    const response = await tasksApi.createTask(request);
    if (response.success) {
      console.log('✅ Tarea creada exitosamente:', response.data);
      return response.data;
    } else {
      console.error('❌ Error al crear la tarea:', response);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error al crear la tarea:', error);
    return null;
  }
}
