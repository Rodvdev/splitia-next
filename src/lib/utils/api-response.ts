import { ApiResponse, Page } from '@/types';

/**
 * Extrae los datos de una respuesta del API, manejando tanto arrays directos
 * como objetos Page con propiedad content.
 * 
 * @param response - La respuesta del API
 * @returns Un array con los datos extraídos, o un array vacío si no hay datos
 */
export function extractDataFromResponse<T>(
  response: ApiResponse<Page<T> | T[] | null | undefined>
): T[] {
  if (!response.success || !response.data) {
    return [];
  }

  const data = response.data;

  // Si es un array directo, retornarlo
  if (Array.isArray(data)) {
    return data;
  }

  // Si tiene propiedad content (objeto Page), retornar content
  if (typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
    return data.content;
  }

  // Caso edge: retornar array vacío
  return [];
}

/**
 * Extrae un objeto único de una respuesta del API.
 * Útil para respuestas que devuelven un solo objeto en lugar de un array.
 * 
 * @param response - La respuesta del API
 * @returns El objeto extraído, o null si no hay datos
 */
export function extractSingleDataFromResponse<T>(
  response: ApiResponse<T | null | undefined>
): T | null {
  if (!response.success || !response.data) {
    return null;
  }

  return response.data;
}

