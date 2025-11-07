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
import { CreateExpenseRequest, ExpenseShareRequest } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const createExpenseSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
  currency: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  categoryId: z.string().optional(),
  paidById: z.string().min(1, 'El usuario que pagó es requerido'),
  shares: z.array(z.object({
    userId: z.string(),
    amount: z.number(),
    type: z.enum(['EQUAL', 'PERCENTAGE', 'FIXED']),
  })).min(1, 'Debe haber al menos una participación'),
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

export default function CreateExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
  });

  const onSubmit = async (data: CreateExpenseFormData) => {
    setIsLoading(true);
    const request: CreateExpenseRequest = {
      amount: data.amount,
      description: data.description,
      date: data.date,
      currency: data.currency,
      location: data.location,
      notes: data.notes,
      groupId: data.groupId,
      categoryId: data.categoryId,
      paidById: data.paidById,
      shares: data.shares.map(s => ({
        userId: s.userId,
        amount: s.amount,
        type: s.type,
      })),
    };
    try {
      const response = await adminApi.createExpense(request);
      apiLogger.expenses({
        endpoint: 'createExpense',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Gasto creado exitosamente');
        router.push('/admin/expenses');
      }
    } catch (error: any) {
      apiLogger.expenses({
        endpoint: 'createExpense',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear el gasto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Gasto</h1>
          <p className="text-muted-foreground">Crea un nuevo gasto en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Gasto</CardTitle>
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
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" placeholder="USD" {...register('currency')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (opcional)</Label>
                <Input id="location" {...register('location')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input id="notes" {...register('notes')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupId">ID del Grupo (opcional)</Label>
                <Input id="groupId" {...register('groupId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">ID de Categoría (opcional)</Label>
                <Input id="categoryId" {...register('categoryId')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidById">ID del Usuario que Pagó</Label>
              <Input id="paidById" {...register('paidById')} />
              {errors.paidById && <p className="text-sm text-destructive">{errors.paidById.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Participaciones (formato JSON simplificado - se puede mejorar después)</Label>
              <Input placeholder='[{"userId":"...","amount":100,"type":"EQUAL"}]' disabled />
              <p className="text-xs text-muted-foreground">Nota: La funcionalidad completa de participaciones se implementará después</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Gasto'}
              </Button>
              <Link href="/admin/expenses">
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

