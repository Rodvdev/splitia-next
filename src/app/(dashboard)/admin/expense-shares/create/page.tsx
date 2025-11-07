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
import { CreateExpenseShareRequest } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const createExpenseShareSchema = z.object({
  expenseId: z.string().min(1, 'El ID del gasto es requerido'),
  userId: z.string().min(1, 'El ID del usuario es requerido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  type: z.enum(['EQUAL', 'PERCENTAGE', 'FIXED'], {
    required_error: 'El tipo es requerido',
  }),
});

type CreateExpenseShareFormData = z.infer<typeof createExpenseShareSchema>;

export default function CreateExpenseSharePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExpenseShareFormData>({
    resolver: zodResolver(createExpenseShareSchema),
  });

  const onSubmit = async (data: CreateExpenseShareFormData) => {
    setIsLoading(true);
    const request: CreateExpenseShareRequest = {
      expenseId: data.expenseId,
      userId: data.userId,
      amount: data.amount,
      type: data.type,
    };
    try {
      const response = await adminApi.createExpenseShare(request);
      apiLogger.expenses({
        endpoint: 'createExpenseShare',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Participación creada exitosamente');
        router.push('/admin/expense-shares');
      }
    } catch (error: any) {
      apiLogger.expenses({
        endpoint: 'createExpenseShare',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la participación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/expense-shares">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Participación</h1>
          <p className="text-muted-foreground">Crea una nueva participación en un gasto</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Participación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenseId">ID del Gasto</Label>
              <Input id="expenseId" placeholder="UUID del gasto" {...register('expenseId')} />
              {errors.expenseId && <p className="text-sm text-destructive">{errors.expenseId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">ID del Usuario</Label>
              <Input id="userId" placeholder="UUID del usuario" {...register('userId')} />
              {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" placeholder="100.00" {...register('amount', { valueAsNumber: true })} />
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Participación'}
              </Button>
              <Link href="/admin/expense-shares">
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

