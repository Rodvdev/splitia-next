'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuthRestore } from '@/hooks/useAuthRestore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { isRestoring } = useAuthRestore();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si ya se inicializó y no está autenticado
    if (isInitialized && !isRestoring && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, isRestoring, router]);

  // Mostrar loading mientras se restaura la sesión o se inicializa
  if (isRestoring || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Si no está autenticado después de inicializar, mostrar loading
  // (el useEffect redirigirá a login)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}

