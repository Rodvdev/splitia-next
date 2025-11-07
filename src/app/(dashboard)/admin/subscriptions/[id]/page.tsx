'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SubscriptionResponse, UpdateSubscriptionRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, CreditCard, Calendar, DollarSign, Tag, RefreshCw, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';

const updateSubscriptionSchema = z.object({
  planType: z.enum(['FREE', 'PREMIUM', 'ENTERPRISE']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE']).optional(),
  autoRenew: z.boolean().optional(),
});

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>;

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSubscriptionFormData>({
    resolver: zodResolver(updateSubscriptionSchema),
  });

  useEffect(() => {
    if (subscriptionId) {
      loadSubscription();
    }
  }, [subscriptionId]);

  useEffect(() => {
    if (subscription && isEditing) {
      reset({
        planType: subscription.planType,
        status: subscription.status,
        autoRenew: subscription.autoRenew,
      });
    }
  }, [subscription, isEditing, reset]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getSubscriptionById(subscriptionId);
      if (response.success) {
        setSubscription(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateSubscriptionFormData) => {
    setIsSaving(true);
    try {
      const request: UpdateSubscriptionRequest = {
        planType: data.planType,
        status: data.status,
        autoRenew: data.autoRenew,
      };
      const response = await adminApi.updateSubscription(subscriptionId, request);
      if (response.success) {
        toast.success('Suscripción actualizada exitosamente');
        setSubscription(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la suscripción');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta suscripción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteSubscription(subscriptionId);
      if (response.success) {
        toast.success('Suscripción eliminada correctamente');
        router.push('/admin/subscriptions');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la suscripción');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      FREE: 'Gratis',
      PREMIUM: 'Premium',
      ENTERPRISE: 'Enterprise',
    };
    return labels[plan] || plan;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
      PAST_DUE: 'Vencida',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      ACTIVE: 'default',
      INACTIVE: 'outline',
      CANCELLED: 'destructive',
      EXPIRED: 'outline',
      PAST_DUE: 'destructive',
    };
    return variants[status] || 'outline';
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

  if (!subscription) {
    return <ErrorMessage message="Suscripción no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/subscriptions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Suscripción</h1>
          <p className="text-muted-foreground">Información completa de la suscripción</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Suscripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{subscription.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Plan:</span>
                    <Badge variant="outline">{getPlanLabel(subscription.planType)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={getStatusVariant(subscription.status)}>
                      {getStatusLabel(subscription.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Precio Mensual</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(subscription.pricePerMonth, subscription.currency, 'es')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Moneda:</span>
                    <Badge variant="outline">{subscription.currency}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Auto-renovación:</span>
                    <Badge variant={subscription.autoRenew ? 'default' : 'outline'}>
                      {subscription.autoRenew ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                      <p className="text-sm">{formatDate(subscription.startDate, 'PP', 'es')}</p>
                    </div>
                  </div>
                  {subscription.endDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha de Fin</p>
                        <p className="text-sm">{formatDate(subscription.endDate, 'PP', 'es')}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Creado</p>
                      <p className="text-sm">{formatDate(subscription.createdAt, 'PP', 'es')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Suscripción
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Suscripción'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Suscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planType">Plan</Label>
                <select id="planType" {...register('planType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="FREE">Gratis</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select id="status" {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="ACTIVE">Activa</option>
                  <option value="INACTIVE">Inactiva</option>
                  <option value="CANCELLED">Cancelada</option>
                  <option value="EXPIRED">Expirada</option>
                  <option value="PAST_DUE">Vencida</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  {...register('autoRenew')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="autoRenew">Auto-renovación</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

