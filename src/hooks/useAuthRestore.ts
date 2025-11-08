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
            // Token inválido, intentar refresh
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              try {
                const refreshResponse = await authApi.refresh(refreshToken);
                if (refreshResponse.success) {
                  const { token: newToken } = refreshResponse.data;
                  setToken(newToken);
                  const meResponse = await authApi.me();
                  if (meResponse.success && meResponse.data) {
                    setUser(meResponse.data);
                  }
                } else {
                  useAuthStore.getState().logout();
                }
              } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                useAuthStore.getState().logout();
              }
            } else {
              useAuthStore.getState().logout();
            }
          }
        } catch (error) {
          // Error al validar token (puede estar expirado)
          // Intentar refresh si hay refreshToken
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            try {
              const refreshResponse = await authApi.refresh(refreshToken);
              if (refreshResponse.success) {
                // Token refrescado exitosamente
                const { token: newToken } = refreshResponse.data;
                setToken(newToken);
                // Obtener usuario actualizado
                const meResponse = await authApi.me();
                if (meResponse.success && meResponse.data) {
                  setUser(meResponse.data);
                }
              } else {
                // Refresh falló, limpiar sesión
                useAuthStore.getState().logout();
              }
            } catch (refreshError) {
              // Refresh falló, limpiar sesión
              console.error('Error refreshing token:', refreshError);
              useAuthStore.getState().logout();
            }
          } else {
            // No hay refresh token, pero mantener sesión si hay token
            // El interceptor manejará el refresh cuando sea necesario
            console.log('No refresh token available, but token exists');
          }
        }
      } else {
        // No hay token, verificar si hay refreshToken
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refresh(refreshToken);
            if (refreshResponse.success) {
              const { token: newToken } = refreshResponse.data;
              setToken(newToken);
              const meResponse = await authApi.me();
              if (meResponse.success && meResponse.data) {
                setUser(meResponse.data);
              }
            } else {
              useAuthStore.getState().logout();
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
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

