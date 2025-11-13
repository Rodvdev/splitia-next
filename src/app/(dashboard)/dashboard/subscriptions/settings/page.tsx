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
import { extractDataFromResponse } from '@/lib/utils/api-response';

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
      // Cargar suscripción y planes en paralelo, sin que un fallo bloquee el otro
      const [subscriptionResult, plansResult] = await Promise.allSettled([
        subscriptionsApi.getCurrent(),
        plansApi.getAll({ page: 0, size: 10 }),
      ]);

      // Suscripción actual
      if (
        subscriptionResult.status === 'fulfilled' &&
        subscriptionResult.value?.success &&
        subscriptionResult.value.data
      ) {
        setSubscription(subscriptionResult.value.data);
      } else {
        // Mantener la suscripción como null si no existe o hubo error
        console.warn('No se pudo cargar la suscripción actual o no existe');
      }

      // Planes disponibles
      const enterpriseFallback: PlanResponse = {
        id: 'synthetic-enterprise',
        name: 'ENTERPRISE',
        pricePerMonth: 29.99,
        currency: 'USD',
        maxGroups: null,
        maxGroupMembers: null,
        maxExpensesPerGroup: null,
        maxBudgetsPerGroup: null,
        maxAiRequestsPerMonth: null,
        hasKanban: true,
        hasAdvancedAnalytics: true,
        hasExportData: true,
        hasPrioritySupport: true,
        hasCustomCategories: true,
        createdAt: new Date().toISOString(),
      };

      const freeFallback: PlanResponse = {
        id: 'synthetic-free',
        name: 'FREE',
        pricePerMonth: 0,
        currency: 'USD',
        maxGroups: 1,
        maxGroupMembers: 10,
        maxExpensesPerGroup: 100,
        maxBudgetsPerGroup: 2,
        maxAiRequestsPerMonth: 20,
        hasKanban: false,
        hasAdvancedAnalytics: false,
        hasExportData: false,
        hasPrioritySupport: false,
        hasCustomCategories: false,
        createdAt: new Date().toISOString(),
      };

      const proFallback: PlanResponse = {
        id: 'synthetic-pro',
        name: 'PRO',
        pricePerMonth: 9.99,
        currency: 'USD',
        maxGroups: 20,
        maxGroupMembers: 100,
        maxExpensesPerGroup: 10000,
        maxBudgetsPerGroup: 50,
        maxAiRequestsPerMonth: 200,
        hasKanban: true,
        hasAdvancedAnalytics: true,
        hasExportData: true,
        hasPrioritySupport: false,
        hasCustomCategories: true,
        createdAt: new Date().toISOString(),
      };

      if (
        plansResult.status === 'fulfilled' &&
        plansResult.value?.success
      ) {
        // Normalizar y garantizar que exista el plan ENTERPRISE en la UI.
        const loadedPlans = extractDataFromResponse(plansResult.value) as PlanResponse[];
        const byName = (name: string) => loadedPlans.find((p) => p.name?.toUpperCase() === name);

        const ensuredPlans: PlanResponse[] = [
          byName('FREE') ?? freeFallback,
          byName('PRO') ?? byName('PREMIUM') ?? proFallback,
          byName('ENTERPRISE') ?? enterpriseFallback,
        ];

        setPlans(ensuredPlans);
      } else {
        // Si falla el endpoint, mostrar siempre las 3 opciones por defecto.
        console.warn('No se pudieron cargar los planes, usando fallback');
        setPlans([freeFallback, proFallback, enterpriseFallback]);
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
    try {
      setChangingPlan(planId);
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        toast.error('Plan no encontrado');
        return;
      }

      // Mapear el nombre del plan al planType (alineado con PRO)
      const planTypeMap: Record<string, 'FREE' | 'PRO' | 'ENTERPRISE'> = {
        FREE: 'FREE',
        PRO: 'PRO',
        PREMIUM: 'PRO', // compatibilidad con valores antiguos
        ENTERPRISE: 'ENTERPRISE',
      };

      const planType = planTypeMap[plan.name.toUpperCase()] || 'FREE';

      // Cuando existe suscripción y se selecciona FREE, tratamos como cancelación
      if (subscription) {
        const currentType = normalizePlanType(subscription.planType);
        if (planType === currentType) {
          toast.info('Ya estás en este plan');
          return;
        }

        if (planType === 'FREE') {
          await handleCancelSubscription();
          return;
        }

        // Cambio de plan (upgrade o downgrade permitido)
        const response = await subscriptionsApi.update(subscription.id, {
          planType,
        });

        if (response.success) {
          toast.success('Plan actualizado exitosamente');
          await loadData();
        }
      } else {
        // Sin suscripción: FREE es estado activo implícito, no se crea suscripción FREE
        if (planType === 'FREE') {
          toast.info('Ya estás en el plan FREE');
          return;
        }

        const response = await subscriptionsApi.create({
          planType,
          paymentMethod: 'DEFAULT',
        });

        if (response.success) {
          toast.success('Suscripción creada exitosamente');
          await loadData();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el cambio de plan');
    } finally {
      setChangingPlan(null);
    }
  };

  const formatLimit = (value: number | null): string => {
    return value === null ? 'Ilimitado' : value.toLocaleString();
  };

  // Normalización y jerarquía de planes para decidir upgrades válidos
  const normalizePlanTypeFromName = (name: string): 'FREE' | 'PRO' | 'ENTERPRISE' => {
    const key = (name || '').toUpperCase();
    if (key === 'FREE') return 'FREE';
    if (key === 'PRO' || key === 'PREMIUM') return 'PRO';
    return 'ENTERPRISE';
  };

  const normalizePlanType = (type: string): 'FREE' | 'PRO' | 'ENTERPRISE' => {
    const key = (type || '').toUpperCase();
    if (key === 'FREE') return 'FREE';
    if (key === 'PRO' || key === 'PREMIUM') return 'PRO';
    return 'ENTERPRISE';
  };

  const PLAN_TIER: Record<'FREE' | 'PRO' | 'ENTERPRISE', number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
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
                    {subscription.pricePerMonth === 0 || subscription.planType === 'FREE'
                      ? 'Gratis'
                      : subscription.pricePerMonth != null
                        ? `${subscription.currency ?? ''} ${subscription.pricePerMonth.toFixed(2)}`
                        : subscription.currency
                          ? `${subscription.currency} —`
                          : '—'}
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
              <CardTitle>Selecciona un Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                  const normalized = normalizePlanTypeFromName(plan.name);
                  const currentType = normalizePlanType(subscription.planType);
                  const isCurrent = normalized === currentType;
                  const isFree = normalized === 'FREE';

                  return (
                    <Card key={plan.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-2xl font-bold">
                          {plan.pricePerMonth === 0
                            ? 'Gratis'
                            : plan.pricePerMonth != null
                              ? `${plan.currency ?? ''} ${plan.pricePerMonth.toFixed(2)}/mes`
                              : plan.currency
                                ? `${plan.currency} —/mes`
                                : '—/mes'}
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
                        <Button
                          onClick={() => handleChangePlan(plan.id)}
                          disabled={changingPlan === plan.id || isCurrent}
                          className="w-full"
                        >
                          {isCurrent
                            ? 'Plan actual'
                            : changingPlan === plan.id
                              ? 'Cambiando...'
                              : 'Seleccionar Plan'}
                        </Button>
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
          <CardHeader>
            <CardTitle>Selecciona un Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const normalized = normalizePlanTypeFromName(plan.name);
                const isFree = normalized === 'FREE';
                return (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="text-2xl font-bold">
                        {plan.pricePerMonth === 0
                          ? 'Gratis'
                          : plan.pricePerMonth != null
                            ? `${plan.currency ?? ''} ${plan.pricePerMonth.toFixed(2)}/mes`
                            : plan.currency
                              ? `${plan.currency} —/mes`
                              : '—/mes'}
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
                      <Button
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={changingPlan === plan.id || isFree}
                        className="w-full"
                      >
                        {isFree
                          ? 'Plan activo'
                          : changingPlan === plan.id
                            ? 'Creando...'
                            : 'Seleccionar Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

