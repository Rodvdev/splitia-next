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
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { salesApi } from '@/lib/api/sales';
import { CreateOpportunityRequest, UserResponse, OpportunityStage } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { adminApi } from '@/lib/api/admin';
import { Slider } from '@/components/ui/slider';

const createOpportunitySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  estimatedValue: z.number().min(0.01, 'El valor debe ser mayor a 0'),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  assignedToId: z.string().optional(),
  currency: z.string().optional(),
});

type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      stage: 'LEAD',
      probability: 0,
      currency: 'USD',
    },
  });

  const selectedContactId = watch('contactId');
  const selectedCompanyId = watch('companyId');
  const selectedAssignedToId = watch('assignedToId');

  const onSubmit = async (data: CreateOpportunityFormData) => {
    setIsLoading(true);
    const request: CreateOpportunityRequest = {
      name: data.name,
      description: data.description,
      stage: data.stage || 'LEAD',
      estimatedValue: data.estimatedValue,
      probability: data.probability || 0,
      expectedCloseDate: data.expectedCloseDate,
      contactId: data.contactId,
      companyId: data.companyId,
      assignedToId: data.assignedToId,
      currency: data.currency || 'USD',
    };
    try {
      const response = await salesApi.createOpportunity(request);
      apiLogger.sales({
        endpoint: 'createOpportunity',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Oportunidad creada exitosamente');
        router.push('/admin/crm/sales/opportunities');
      }
    } catch (error: any) {
      apiLogger.sales({
        endpoint: 'createOpportunity',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la oportunidad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/crm/sales/opportunities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Oportunidad</h1>
          <p className="text-muted-foreground">Crea una nueva oportunidad de venta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Oportunidad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Información Básica</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" placeholder="Ej: Implementación de Splitia para empresa X" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción detallada de la oportunidad..."
                  {...register('description')}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Etapa</Label>
                  <select
                    id="stage"
                    {...register('stage')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="LEAD">Lead</option>
                    <option value="QUALIFIED">Calificado</option>
                    <option value="PROPOSAL">Propuesta</option>
                    <option value="NEGOTIATION">Negociación</option>
                    <option value="CLOSED_WON">Cerrado ganado</option>
                    <option value="CLOSED_LOST">Cerrado perdido</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    {...register('currency')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Valoración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Valor Estimado (USD) *</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('estimatedValue', { valueAsNumber: true })}
                  />
                  {errors.estimatedValue && (
                    <p className="text-sm text-destructive">{errors.estimatedValue.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Fecha de Cierre Esperada</Label>
                  <Input id="expectedCloseDate" type="date" {...register('expectedCloseDate')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Probabilidad de Cierre: {watch('probability') || 0}%</Label>
                <Slider
                  value={[watch('probability') || 0]}
                  onValueChange={(value) => setValue('probability', value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Asignaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactId">Contacto</Label>
                  <AsyncPaginatedSelect<UserResponse>
                    value={selectedContactId}
                    onChange={(val) => setValue('contactId', val)}
                    placeholder="Seleccionar contacto"
                    getOptionLabel={(u) => `${u.name} ${u.lastName || ''} (${u.email})`}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Empresa</Label>
                  <AsyncPaginatedSelect<UserResponse>
                    value={selectedCompanyId}
                    onChange={(val) => setValue('companyId', val)}
                    placeholder="Seleccionar empresa"
                    getOptionLabel={(u) => `${u.name} ${u.lastName || ''} (${u.email})`}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedToId">Vendedor Asignado</Label>
                  <AsyncPaginatedSelect<UserResponse>
                    value={selectedAssignedToId}
                    onChange={(val) => setValue('assignedToId', val)}
                    placeholder="Seleccionar vendedor"
                    getOptionLabel={(u) => `${u.name} ${u.lastName || ''} (${u.email})`}
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
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Oportunidad'}
              </Button>
              <Link href="/admin/crm/sales/opportunities">
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

