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
import { CreateSettlementRequest, UserResponse } from '@/types';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const createSettlementSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  currency: z.string().min(1, 'La moneda es requerida'),
  description: z.string().optional(),
  userId: z.string().min(1, 'El ID de usuario es requerido'),
  type: z.enum(['PAYMENT', 'RECEIPT'], { required_error: 'El tipo es requerido' }),
});

type CreateSettlementFormData = z.infer<typeof createSettlementSchema>;

export default function CreateSettlementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSettlementFormData>({
    resolver: zodResolver(createSettlementSchema),
  });

  const selectedUserId = watch('userId');

  const onSubmit = async (data: CreateSettlementFormData) => {
    setIsLoading(true);
    const request: CreateSettlementRequest = {
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      userId: data.userId,
      type: data.type,
    };
    try {
      const response = await adminApi.createSettlement(request);
      apiLogger.settlements({
        endpoint: 'createSettlement',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Liquidación creada exitosamente');
        router.push('/admin/settlements');
      }
    } catch (error: any) {
      apiLogger.settlements({
        endpoint: 'createSettlement',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la liquidación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settlements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Liquidación</h1>
          <p className="text-muted-foreground">Crea una nueva liquidación en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Liquidación</CardTitle>
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
                <Input id="currency" placeholder="USD" {...register('currency')} />
                {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Usuario</Label>
                <AsyncPaginatedSelect<UserResponse>
                  value={selectedUserId}
                  onChange={(val) => setValue('userId', val)}
                  placeholder="Seleccionar usuario"
                  getOptionLabel={(u) => `${u.name} ${u.lastName} (${u.email})`}
                  getOptionValue={(u) => u.id}
                  fetchPage={async (page, size) => {
                    const res = await adminApi.getAllUsers({ page, size });
                    const data: any = res.data as any;
                    return {
                      items: Array.isArray(data?.content) ? (data.content as UserResponse[]) : [],
                      total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                    };
                  }}
                />
                {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select id="type" {...register('type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PAYMENT">Pago</option>
                  <option value="RECEIPT">Recibo</option>
                </select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Liquidación'}
              </Button>
              <Link href="/admin/settlements">
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

