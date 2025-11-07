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
import { SettlementResponse, UpdateSettlementRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, FileText, Calendar, DollarSign, Tag, User, Users, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const updateSettlementSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0').optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
});

type UpdateSettlementFormData = z.infer<typeof updateSettlementSchema>;

export default function SettlementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const settlementId = params.id as string;
  const [settlement, setSettlement] = useState<SettlementResponse | null>(null);
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
  } = useForm<UpdateSettlementFormData>({
    resolver: zodResolver(updateSettlementSchema),
  });

  useEffect(() => {
    if (settlementId) {
      loadSettlement();
    }
  }, [settlementId]);

  useEffect(() => {
    if (settlement && isEditing) {
      reset({
        amount: settlement.amount,
        description: settlement.description,
        status: settlement.status,
      });
    }
  }, [settlement, isEditing, reset]);

  const loadSettlement = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getSettlementById(settlementId);
      apiLogger.settlements({
        endpoint: 'getSettlementById',
        success: response.success,
        params: { id: settlementId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setSettlement(response.data);
      }
    } catch (err: any) {
      apiLogger.settlements({
        endpoint: 'getSettlementById',
        success: false,
        params: { id: settlementId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar la liquidación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateSettlementFormData) => {
    setIsSaving(true);
    const request: UpdateSettlementRequest = {
      amount: data.amount,
      description: data.description,
      status: data.status,
    };
    try {
      const response = await adminApi.updateSettlement(settlementId, request);
      apiLogger.settlements({
        endpoint: 'updateSettlement',
        success: response.success,
        params: { id: settlementId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Liquidación actualizada exitosamente');
        setSettlement(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.settlements({
        endpoint: 'updateSettlement',
        success: false,
        params: { id: settlementId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la liquidación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta liquidación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteSettlement(settlementId);
      apiLogger.settlements({
        endpoint: 'deleteSettlement',
        success: response.success,
        params: { id: settlementId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Liquidación eliminada correctamente');
        router.push('/admin/settlements');
      }
    } catch (err: any) {
      apiLogger.settlements({
        endpoint: 'deleteSettlement',
        success: false,
        params: { id: settlementId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar la liquidación');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      PENDING_CONFIRMATION: 'Pendiente Confirmación',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PAYMENT: 'Pago',
      RECEIPT: 'Recibo',
    };
    return labels[type] || type;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      PENDING: 'outline',
      PENDING_CONFIRMATION: 'secondary',
      CONFIRMED: 'default',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
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

  if (!settlement) {
    return <ErrorMessage message="Liquidación no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settlements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Liquidación</h1>
          <p className="text-muted-foreground">Información completa de la liquidación</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Liquidación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{settlement.id}</p>
                  </div>
                  {settlement.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                      <p className="text-sm">{settlement.description}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monto</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(settlement.amount, settlement.currency, 'es')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Moneda:</span>
                    <Badge variant="outline">{settlement.currency}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={getStatusVariant(settlement.status)}>
                      {getStatusLabel(settlement.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tipo:</span>
                    <Badge variant="outline">{getTypeLabel(settlement.type)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Fecha: {formatDate(settlement.date, 'PP', 'es')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Creado: {formatDate(settlement.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Involucrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Iniciado por</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {settlement.initiatedBy.name[0]}{settlement.initiatedBy.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {settlement.initiatedBy.name} {settlement.initiatedBy.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{settlement.initiatedBy.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Liquidado con</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {settlement.settledWithUser.name[0]}{settlement.settledWithUser.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {settlement.settledWithUser.name} {settlement.settledWithUser.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{settlement.settledWithUser.email}</p>
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
                  Editar Liquidación
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Liquidación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Liquidación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" {...register('description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select id="status" {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PENDING">Pendiente</option>
                  <option value="PENDING_CONFIRMATION">Pendiente Confirmación</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
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

