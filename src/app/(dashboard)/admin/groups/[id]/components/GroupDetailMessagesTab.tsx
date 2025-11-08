'use client';

import { EmptyState } from '@/components/common/EmptyState';

export default function GroupDetailMessagesTab({ groupId }: { groupId: string }) {
  // TODO: Implement message filtering by group
  return (
    <EmptyState
      title="Mensajes del Grupo"
      description="Los mensajes filtrados por grupo estarán disponibles próximamente"
    />
  );
}

