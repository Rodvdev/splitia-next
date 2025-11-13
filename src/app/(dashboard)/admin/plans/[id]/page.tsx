'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { PlanResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, CreditCard, Check, X, Users, Zap, DollarSign, BarChart3, Download, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getPlanById(planId);
      apiLogger.plans({
        endpoint: 'getPlanById',
        success: response.success,
        params: { id: planId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setPlan(response.data);
      }
    } catch (err: any) {
      apiLogger.plans({
        endpoint: 'getPlanById',
        success: false,
        params: { id: planId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar el plan');
    } finally {
      setLoading(false);
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

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!plan) {
    return <ErrorMessage message="Plan no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{plan.name}</h1>
          <p className="text-muted-foreground">Detalles del plan de suscripción</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="text-lg font-semibold">{plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio Mensual</p>
              <p className="text-lg font-semibold">
                {plan.pricePerMonth === 0
                  ? 'Gratis'
                  : plan.pricePerMonth != null
                    ? `${plan.currency ?? ''} ${plan.pricePerMonth.toFixed(2)}/mes`
                    : plan.currency
                      ? `${plan.currency} —/mes`
                      : '—/mes'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Creación</p>
              <p className="text-sm">{formatDate(plan.createdAt, 'PP', 'es')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Límites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Grupos Máximos</p>
              <p className="text-lg font-semibold">{formatLimit(plan.maxGroups)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembros por Grupo</p>
              <p className="text-lg font-semibold">{formatLimit(plan.maxGroupMembers)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solicitudes IA/mes</p>
              <p className="text-lg font-semibold">{formatLimit(plan.maxAiRequestsPerMonth)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gastos por Grupo</p>
              <p className="text-lg font-semibold">{formatLimit(plan.maxExpensesPerGroup)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Presupuestos por Grupo</p>
              <p className="text-lg font-semibold">{formatLimit(plan.maxBudgetsPerGroup)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Características
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Kanban</span>
                </div>
                {plan.hasKanban ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Análisis Avanzados</span>
                </div>
                {plan.hasAdvancedAnalytics ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Categorías Personalizadas</span>
                </div>
                {plan.hasCustomCategories ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Exportación de Datos</span>
                </div>
                {plan.hasExportData ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <HeadphonesIcon className="h-4 w-4" />
                  <span>Soporte Prioritario</span>
                </div>
                {plan.hasPrioritySupport ? (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

