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
  planType: z.enum(['FREE', 'PRO', 'ENTERPRISE'], {
    required_error: 'El tipo de plan es requerido',
  }),
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

  const selectedPlanType = watch('planType');

  const onSubmit = async (data: CreateSubscriptionFormData) => {
    setIsLoading(true);
    const request: CreateSubscriptionRequest = {
      planType: data.planType,
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
              <Label htmlFor="planType">Tipo de Plan</Label>
              <Select
                value={selectedPlanType}
                onValueChange={(val) => setValue('planType', val as 'FREE' | 'PRO' | 'ENTERPRISE')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              {errors.planType && <p className="text-sm text-destructive">{errors.planType.message}</p>}
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

