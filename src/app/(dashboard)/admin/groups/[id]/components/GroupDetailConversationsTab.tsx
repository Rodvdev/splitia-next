'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { MessageSquare } from 'lucide-react';

export default function GroupDetailConversationsTab({ groupId }: { groupId: string }) {
  // TODO: Implement conversation filtering by group
  return (
    <EmptyState
      title="Conversaciones del Grupo"
      description="Las conversaciones filtradas por grupo estarán disponibles próximamente"
      icon={MessageSquare}
    />
  );
}

