import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground">Gestiona tus presupuestos mensuales</p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Presupuesto
          </Button>
        </Link>
      </div>

      <EmptyState
        title="No hay presupuestos"
        description="Crea tu primer presupuesto para empezar a controlar tus gastos"
        action={
          <Link href="/dashboard/budgets/new">
            <Button>Crear Presupuesto</Button>
          </Link>
        }
      />
    </div>
  );
}

