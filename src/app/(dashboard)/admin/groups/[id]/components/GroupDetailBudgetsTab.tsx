'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export default function GroupDetailBudgetsTab({ groupId }: { groupId: string }) {
  // TODO: Implement budget filtering by group
  return (
    <EmptyState
      title="Presupuestos del Grupo"
      description="Los presupuestos filtrados por grupo estarán disponibles próximamente"
      action={<Link href={`/admin/groups/${groupId}/budgets`}><Button variant="outline">Ver presupuestos</Button></Link>}
    />
  );
}

