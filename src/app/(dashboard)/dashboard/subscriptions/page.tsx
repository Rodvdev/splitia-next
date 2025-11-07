'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { SubscriptionResponse } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import Link from 'next/link';
import { apiLogger } from '@/lib/utils/api-logger';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Gratuito',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
  PAST_DUE: 'Vencida',
};

const STATUS_COLORS: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  ACTIVE: 'default',
  INACTIVE: 'outline',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
  PAST_DUE: 'outline',
};

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionsApi.getCurrent();
      apiLogger.subscriptions({
        endpoint: 'getCurrent',
        success: response.success,
        params: {},
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setSubscription(response.data);
      }
    } catch (err) {
      apiLogger.subscriptions({
        endpoint: 'getCurrent',
        success: false,
        params: {},
        error: err,
      });
      // Si no hay suscripción, el error es esperado
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar la suscripción';
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setSubscription(null);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadSubscription} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
        </div>
        <EmptyState
          title="No tienes una suscripción activa"
          description="Suscríbete a un plan para obtener acceso a todas las funciones"
          action={
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Planes Disponibles
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
        </div>
        {subscription && (
          <Link href="/dashboard/subscriptions/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan Actual
            </CardTitle>
            <Badge 
              variant={STATUS_COLORS[subscription.status] || 'default'}
              className={subscription.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : subscription.status === 'PAST_DUE' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
            >
              {PLAN_LABELS[subscription.planType] || subscription.planType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <div className="flex items-center gap-2 mt-1">
                {subscription.status === 'ACTIVE' ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : subscription.status === 'PAST_DUE' ? (
                  <AlertCircle className="h-4 w-4 text-warning" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <p className="text-base font-medium">
                  {STATUS_LABELS[subscription.status] || subscription.status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Precio Mensual</p>
              <p className="text-base font-medium">
                {subscription.currency} {subscription.pricePerMonth.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
              <p className="text-base font-medium">
                {format(new Date(subscription.startDate), 'dd MMMM yyyy')}
              </p>
            </div>

            {subscription.endDate && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                <p className="text-base font-medium">
                  {format(new Date(subscription.endDate), 'dd MMMM yyyy')}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Renovación Automática</p>
              <p className="text-base font-medium">
                {subscription.autoRenew ? (
                  <span className="text-success">Activada</span>
                ) : (
                  <span className="text-muted-foreground">Desactivada</span>
                )}
              </p>
            </div>
          </div>

          {subscription.status === 'ACTIVE' && (
            <div className="pt-4 border-t">
              <Link href="/dashboard/subscriptions/settings">
                <Button variant="outline" className="w-full sm:w-auto">
                  Cambiar Plan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

