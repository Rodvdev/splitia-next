'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { CreateBudgetRequest } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const createBudgetSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  month: z.number().min(1).max(12, 'El mes debe estar entre 1 y 12'),
  year: z.number().min(2000).max(2100, 'El año debe ser válido'),
  currency: z.string().optional(),
  categoryId: z.string().optional(),
});

type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;

export default function CreateBudgetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
  });

  const onSubmit = async (data: CreateBudgetFormData) => {
    setIsLoading(true);
    const request: CreateBudgetRequest = {
      amount: data.amount,
      month: data.month,
      year: data.year,
      currency: data.currency,
      categoryId: data.categoryId,
    };
    try {
      const response = await adminApi.createBudget(request);
      apiLogger.budgets({
        endpoint: 'createBudget',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Presupuesto creado exitosamente');
        router.push('/admin/budgets');
      }
    } catch (error: any) {
      apiLogger.budgets({
        endpoint: 'createBudget',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear el presupuesto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/budgets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Presupuesto</h1>
          <p className="text-muted-foreground">Crea un nuevo presupuesto en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <Input id="month" type="number" min="1" max="12" {...register('month', { valueAsNumber: true })} />
                {errors.month && <p className="text-sm text-destructive">{errors.month.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input id="year" type="number" min="2000" max="2100" {...register('year', { valueAsNumber: true })} />
                {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" placeholder="USD" {...register('currency')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">ID de Categoría (opcional)</Label>
                <Input id="categoryId" {...register('categoryId')} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Presupuesto'}
              </Button>
              <Link href="/admin/budgets">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

