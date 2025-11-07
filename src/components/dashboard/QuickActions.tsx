'use client';

import { Button } from '@/components/ui/button';
import { Plus, Receipt, Users, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'Nuevo Gasto',
      icon: Receipt,
      href: '/expenses/new',
      variant: 'default' as const,
    },
    {
      label: 'Crear Grupo',
      icon: Users,
      href: '/groups/new',
      variant: 'outline' as const,
    },
    {
      label: 'Nuevo Presupuesto',
      icon: Wallet,
      href: '/budgets/new',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.href}
            variant={action.variant}
            className="gap-2"
            onClick={() => router.push(action.href)}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

