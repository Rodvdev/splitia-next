import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Actual</CardTitle>
            <Badge variant="success">FREE</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Estás usando el plan gratuito. Actualiza para obtener más funciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

