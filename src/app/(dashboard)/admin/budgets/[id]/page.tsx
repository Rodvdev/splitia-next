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
import { BudgetResponse, UpdateBudgetRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Wallet, Calendar, Tag, DollarSign, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const updateBudgetSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0').optional(),
  currency: z.string().optional(),
});

type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  const [budget, setBudget] = useState<BudgetResponse | null>(null);
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
  } = useForm<UpdateBudgetFormData>({
    resolver: zodResolver(updateBudgetSchema),
  });

  useEffect(() => {
    if (budgetId) {
      loadBudget();
    }
  }, [budgetId]);

  useEffect(() => {
    if (budget && isEditing) {
      reset({
        amount: budget.amount,
        currency: budget.currency,
      });
    }
  }, [budget, isEditing, reset]);

  const loadBudget = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getBudgetById(budgetId);
      apiLogger.budgets({
        endpoint: 'getBudgetById',
        success: response.success,
        params: { id: budgetId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setBudget(response.data);
      }
    } catch (err: any) {
      apiLogger.budgets({
        endpoint: 'getBudgetById',
        success: false,
        params: { id: budgetId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateBudgetFormData) => {
    setIsSaving(true);
    const request: UpdateBudgetRequest = {
      amount: data.amount,
      currency: data.currency,
    };
    try {
      const response = await adminApi.updateBudget(budgetId, request);
      apiLogger.budgets({
        endpoint: 'updateBudget',
        success: response.success,
        params: { id: budgetId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Presupuesto actualizado exitosamente');
        setBudget(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.budgets({
        endpoint: 'updateBudget',
        success: false,
        params: { id: budgetId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar el presupuesto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteBudget(budgetId);
      apiLogger.budgets({
        endpoint: 'deleteBudget',
        success: response.success,
        params: { id: budgetId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Presupuesto eliminado correctamente');
        router.push('/admin/budgets');
      }
    } catch (err: any) {
      apiLogger.budgets({
        endpoint: 'deleteBudget',
        success: false,
        params: { id: budgetId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar el presupuesto');
    } finally {
      setIsDeleting(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || month.toString();
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

  if (!budget) {
    return <ErrorMessage message="Presupuesto no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/budgets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Presupuesto</h1>
          <p className="text-muted-foreground">Información completa del presupuesto</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Presupuesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{budget.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monto</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(budget.amount, budget.currency, 'es')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Período</p>
                      <p className="text-sm">
                        {getMonthName(budget.month)} {budget.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Moneda:</span>
                    <Badge variant="outline">{budget.currency}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Creado: {formatDate(budget.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {budget.category && (
              <Card>
                <CardHeader>
                  <CardTitle>Categoría</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{budget.category.name}</p>
                      {budget.category.icon && (
                        <p className="text-xs text-muted-foreground">Icono: {budget.category.icon}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Presupuesto
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Presupuesto'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Presupuesto</CardTitle>
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
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" {...register('currency')} />
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

