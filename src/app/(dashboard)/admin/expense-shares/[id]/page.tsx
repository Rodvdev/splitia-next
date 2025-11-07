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
import { ExpenseShareResponse, UpdateExpenseShareRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, User, DollarSign, Tag, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';

const updateExpenseShareSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0').optional(),
  type: z.enum(['EQUAL', 'PERCENTAGE', 'FIXED']).optional(),
});

type UpdateExpenseShareFormData = z.infer<typeof updateExpenseShareSchema>;

export default function ExpenseShareDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;
  const [share, setShare] = useState<ExpenseShareResponse | null>(null);
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
  } = useForm<UpdateExpenseShareFormData>({
    resolver: zodResolver(updateExpenseShareSchema),
  });

  useEffect(() => {
    if (shareId) {
      loadShare();
    }
  }, [shareId]);

  useEffect(() => {
    if (share && isEditing) {
      reset({
        amount: share.amount,
        type: share.type,
      });
    }
  }, [share, isEditing, reset]);

  const loadShare = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getExpenseShareById(shareId);
      if (response.success) {
        setShare(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la participación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateExpenseShareFormData) => {
    setIsSaving(true);
    try {
      const request: UpdateExpenseShareRequest = {
        amount: data.amount,
        type: data.type,
      };
      const response = await adminApi.updateExpenseShare(shareId, request);
      if (response.success) {
        toast.success('Participación actualizada exitosamente');
        setShare(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la participación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta participación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteExpenseShare(shareId);
      if (response.success) {
        toast.success('Participación eliminada correctamente');
        router.push('/admin/expense-shares');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la participación');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EQUAL: 'Igual',
      PERCENTAGE: 'Porcentaje',
      FIXED: 'Fijo',
    };
    return labels[type] || type;
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

  if (!share) {
    return <ErrorMessage message="Participación no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/expense-shares">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Participación</h1>
          <p className="text-muted-foreground">Información completa de la participación</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Participación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{share.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monto</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(share.amount, 'USD', 'es')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tipo:</span>
                    <Badge variant="outline">{getTypeLabel(share.type)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold">
                      {share.user.name[0]}{share.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{share.user.name} {share.user.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{share.user.email}</p>
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
                  Editar Participación
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Participación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Participación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto</Label>
                  <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <select id="type" {...register('type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="EQUAL">Igual</option>
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED">Fijo</option>
                  </select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
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

