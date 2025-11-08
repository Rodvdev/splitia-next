'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { Mail } from 'lucide-react';

export default function GroupDetailMessagesTab({ groupId }: { groupId: string }) {
  // TODO: Implement message filtering by group
  return (
    <EmptyState
      title="Mensajes del Grupo"
      description="Los mensajes filtrados por grupo estarán disponibles próximamente"
      icon={Mail}
    />
  );
}

