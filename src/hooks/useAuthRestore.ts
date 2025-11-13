'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import { getToken, getRefreshToken } from '@/lib/auth/token';

/**
 * Hook para restaurar la sesión del usuario al cargar la aplicación
 * Valida el token con el backend y restaura el estado de autenticación
 */
export function useAuthRestore() {
  const { initializeAuth, setUser, setToken, isInitialized } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(true);
  const hasRestored = useRef(false);

  useEffect(() => {
    // Solo restaurar una vez
    if (hasRestored.current) {
      setIsRestoring(false);
      return;
    }

    const restoreSession = async () => {
      // Si ya se inicializó, solo marcar como restaurado
      if (isInitialized) {
        hasRestored.current = true;
        setIsRestoring(false);
        return;
      }

      // Primero, restaurar desde localStorage
      initializeAuth();

      // Luego, validar el token con el backend
      const token = getToken();
      if (token) {
        try {
          // Validar token llamando a /api/auth/me
          const response = await authApi.me();
          if (response.success && response.data) {
            // Token válido, actualizar usuario
            setUser(response.data);
            setToken(token);
          } else {
            // Token inválido: no intentamos refresh manualmente aquí.
            // El axios interceptor maneja el refresh automáticamente en caso de 401.
            // Limpiamos la sesión para evitar estados inconsistentes.
            useAuthStore.getState().logout();
          }
        } catch (error) {
          // Error al validar token (posiblemente expirado).
          // Evitamos el refresh manual y delegamos al interceptor.
          console.warn('Token inválido, no se pudo restaurar sesión automáticamente:', error);
          useAuthStore.getState().logout();
        }
      } else {
        // No hay token. Si hay refreshToken, intentamos obtener el usuario;
        // el interceptor intentará refrescar automáticamente en el primer 401.
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const meResponse = await authApi.me();
            if (meResponse.success && meResponse.data) {
              setUser(meResponse.data);
              // Actualizamos el token del store desde localStorage si el interceptor lo refrescó.
              const newToken = getToken();
              if (newToken) {
                setToken(newToken);
              }
            } else {
              useAuthStore.getState().logout();
            }
          } catch (error) {
            console.warn('No se pudo restaurar la sesión con refresh token:', error);
            useAuthStore.getState().logout();
          }
        }
      }

      hasRestored.current = true;
      setIsRestoring(false);
    };

    restoreSession();
  }, [initializeAuth, setUser, setToken, isInitialized]);

  const user = useAuthStore((state) => state.user);

  return { isRestoring, user };
}

