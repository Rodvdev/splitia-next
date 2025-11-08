'use client';

import { EmptyState } from '@/components/common/EmptyState';

export default function UsersActivityTab() {
  // TODO: Implement activity tracking/logging system
  // This would show user activity logs, login history, recent actions, etc.
  
  return (
    <div className="space-y-4">
      <EmptyState
        title="Actividad de Usuarios"
        description="El sistema de seguimiento de actividad estará disponible próximamente. Aquí se mostrará el historial de acciones, inicios de sesión y actividad reciente de los usuarios."
      />
    </div>
  );
}

