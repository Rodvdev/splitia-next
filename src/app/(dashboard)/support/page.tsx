import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soporte</h1>
          <p className="text-muted-foreground">Gestiona tus tickets de soporte</p>
        </div>
        <Link href="/dashboard/support/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Ticket
          </Button>
        </Link>
      </div>

      <EmptyState
        title="No hay tickets"
        description="Crea un ticket si necesitas ayuda"
        action={
          <Link href="/dashboard/support/new">
            <Button>Crear Ticket</Button>
          </Link>
        }
      />
    </div>
  );
}

