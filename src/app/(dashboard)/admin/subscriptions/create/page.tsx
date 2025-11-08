'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { CreateSubscriptionRequest, UserResponse, PlanResponse } from '@/types';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const createSubscriptionSchema = z.object({
  userId: z.string().min(1, 'El usuario es requerido'),
  planId: z.string().min(1, 'El plan es requerido'),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
});

type CreateSubscriptionFormData = z.infer<typeof createSubscriptionSchema>;

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateSubscriptionFormData>({
    resolver: zodResolver(createSubscriptionSchema),
  });

  const selectedUserId = watch('userId');
  const selectedPlanId = watch('planId');

  const onSubmit = async (data: CreateSubscriptionFormData) => {
    setIsLoading(true);
    const request: CreateSubscriptionRequest = {
      userId: data.userId,
      planId: data.planId,
      paymentMethod: data.paymentMethod,
    };
    try {
      const response = await adminApi.createSubscription(request);
      apiLogger.subscriptions({
        endpoint: 'createSubscription',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Suscripción creada exitosamente');
        router.push('/admin/subscriptions');
      }
    } catch (error: any) {
      apiLogger.subscriptions({
        endpoint: 'createSubscription',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la suscripción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/subscriptions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Suscripción</h1>
          <p className="text-muted-foreground">Crea una nueva suscripción en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="planId">Plan</Label>
              <AsyncPaginatedSelect<PlanResponse>
                value={selectedPlanId}
                onChange={(val) => setValue('planId', val)}
                placeholder="Seleccionar plan"
                getOptionLabel={(p) => p.name}
                getOptionValue={(p) => p.id}
                fetchPage={async (page, size) => {
                  const res = await adminApi.getAllPlans({ page, size });
                  const data: any = res.data as any;
                  return {
                    items: Array.isArray(data?.content) ? (data.content as PlanResponse[]) : [],
                    total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                  };
                }}
              />
              {errors.planId && <p className="text-sm text-destructive">{errors.planId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Input id="paymentMethod" placeholder="Método de pago" {...register('paymentMethod')} />
              {errors.paymentMethod && <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Suscripción'}
              </Button>
              <Link href="/admin/subscriptions">
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

