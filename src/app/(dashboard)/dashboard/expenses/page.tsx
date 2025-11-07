import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Gestiona tus gastos individuales y grupales</p>
        </div>
        <Link href="/dashboard/expenses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Gasto
          </Button>
        </Link>
      </div>

      <EmptyState
        title="No hay gastos"
        description="Crea tu primer gasto para empezar a llevar un registro"
        action={
          <Link href="/dashboard/expenses/new">
            <Button>Crear Gasto</Button>
          </Link>
        }
      />
    </div>
  );
}

