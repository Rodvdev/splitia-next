import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupos</h1>
          <p className="text-muted-foreground">Gestiona tus grupos de gastos compartidos</p>
        </div>
        <Link href="/dashboard/groups/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Grupo
          </Button>
        </Link>
      </div>

      <EmptyState
        title="No tienes grupos"
        description="Crea tu primer grupo para empezar a compartir gastos"
        action={
          <Link href="/dashboard/groups/new">
            <Button>Crear Grupo</Button>
          </Link>
        }
      />
    </div>
  );
}

