import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';

export default function SettlementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settlements</h1>
        <p className="text-muted-foreground">Gestiona tus asentamientos de deudas</p>
      </div>

      <EmptyState
        title="No hay settlements"
        description="Los settlements aparecerán aquí cuando haya deudas pendientes"
      />
    </div>
  );
}

