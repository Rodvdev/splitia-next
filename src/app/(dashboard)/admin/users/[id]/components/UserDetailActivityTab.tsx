'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { Activity } from 'lucide-react';

export default function UserDetailActivityTab({ userId }: { userId: string }) {
  // TODO: Implement activity tracking/logging system
  return (
    <EmptyState
      title="Actividad del Usuario"
      description="El sistema de seguimiento de actividad estará disponible próximamente. Aquí se mostrará el historial de acciones, inicios de sesión y actividad reciente del usuario."
      icon={Activity}
    />
  );
}

