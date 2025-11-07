'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { plansApi } from '@/lib/api/plans';
import { SubscriptionResponse, PlanResponse } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionRes, plansRes] = await Promise.all([
        subscriptionsApi.getCurrent().catch(() => ({ success: false, data: null })),
        plansApi.getAll({ page: 0, size: 10 }),
      ]);

      if (subscriptionRes.success) {
        setSubscription(subscriptionRes.data);
      }

      if (plansRes.success) {
        setPlans(plansRes.data.content);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await subscriptionsApi.delete(subscription.id);
      if (response.success) {
        toast.success('Suscripción cancelada exitosamente');
        await loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!subscription) return;

    try {
      setChangingPlan(planId);
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        toast.error('Plan no encontrado');
        return;
      }

      // Mapear el nombre del plan al planType
      const planTypeMap: Record<string, 'FREE' | 'PREMIUM' | 'ENTERPRISE'> = {
        FREE: 'FREE',
        PRO: 'PREMIUM',
        ENTERPRISE: 'ENTERPRISE',
      };

      const planType = planTypeMap[plan.name.toUpperCase()] || 'FREE';

      const response = await subscriptionsApi.update(subscription.id, {
        planType,
      });

      if (response.success) {
        toast.success('Plan actualizado exitosamente');
        await loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar el plan');
    } finally {
      setChangingPlan(null);
    }
  };

  const formatLimit = (value: number | null): string => {
    return value === null ? 'Ilimitado' : value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subscriptions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Configuración de Suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan y suscripción</p>
        </div>
      </div>

      {subscription ? (
        <>
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
                  {STATUS_LABELS[subscription.status] || subscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-base font-medium">{subscription.planType}</p>
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
                      <span className="text-green-600">Activada</span>
                    ) : (
                      <span className="text-muted-foreground">Desactivada</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrentPlan = subscription.planType === plan.name.toUpperCase();
                  return (
                    <Card key={plan.id} className={isCurrentPlan ? 'border-primary' : ''}>
                      <CardHeader>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-2xl font-bold">
                          {plan.pricePerMonth === 0
                            ? 'Gratis'
                            : `${plan.currency} ${plan.pricePerMonth.toFixed(2)}/mes`}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Grupos:</span>
                            <span className="font-medium">{formatLimit(plan.maxGroups)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Miembros:</span>
                            <span className="font-medium">{formatLimit(plan.maxGroupMembers)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>IA/mes:</span>
                            <span className="font-medium">{formatLimit(plan.maxAiRequestsPerMonth)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Kanban:</span>
                            {plan.hasKanban ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        {isCurrentPlan ? (
                          <Button disabled className="w-full">
                            Plan Actual
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleChangePlan(plan.id)}
                            disabled={changingPlan === plan.id}
                            className="w-full"
                          >
                            {changingPlan === plan.id ? 'Cambiando...' : 'Seleccionar Plan'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {subscription.status === 'ACTIVE' && (
            <Card>
              <CardHeader>
                <CardTitle>Cancelar Suscripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Al cancelar tu suscripción, perderás acceso a las funcionalidades premium al final del período de facturación actual.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">No tienes una suscripción activa.</p>
            <Button onClick={() => router.push('/dashboard/subscriptions')}>
              Ver Suscripciones
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

