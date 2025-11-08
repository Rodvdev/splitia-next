'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { UpdateOpportunityRequest, UserResponse, OpportunityStage, OpportunitySource, OpportunityPriority } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { adminApi } from '@/lib/api/admin';
import { Slider } from '@/components/ui/slider';
import { useOpportunity } from '@/hooks/useOpportunities';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const updateOpportunitySchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').optional(),
  description: z.string().optional(),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  source: z.enum(['WEB', 'REFERRAL', 'EVENT', 'PARTNER', 'COLD_CALL', 'SOCIAL_MEDIA', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  estimatedValue: z.number().min(0.01, 'El valor debe ser mayor a 0').optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  contactId: z.string().optional(),
  assignedToId: z.string().optional(),
});

type UpdateOpportunityFormData = z.infer<typeof updateOpportunitySchema>;

export default function EditOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { opportunity, loading: loadingOpportunity } = useOpportunity(id);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateOpportunityFormData>({
    resolver: zodResolver(updateOpportunitySchema),
  });

  useEffect(() => {
    if (opportunity) {
      reset({
        title: opportunity.title,
        description: opportunity.description,
        stage: opportunity.stage,
        source: opportunity.source,
        priority: opportunity.priority,
        estimatedValue: opportunity.estimatedValue,
        probability: opportunity.probability,
        expectedCloseDate: opportunity.expectedCloseDate
          ? opportunity.expectedCloseDate.split('T')[0]
          : undefined,
        actualCloseDate: opportunity.actualCloseDate
          ? opportunity.actualCloseDate.split('T')[0]
          : undefined,
        contactId: opportunity.contactId,
        assignedToId: opportunity.assignedToId,
      });
    }
  }, [opportunity, reset]);

  const probabilityValue = watch('probability') ?? opportunity?.probability ?? 0;
  const selectedContactId = watch('contactId') ?? opportunity?.contactId;
  const selectedAssignedToId = watch('assignedToId') ?? opportunity?.assignedToId;

  const onSubmit = async (data: UpdateOpportunityFormData) => {
    setIsLoading(true);
    const request: UpdateOpportunityRequest = {
      title: data.title,
      description: data.description,
      stage: data.stage,
      source: data.source,
      priority: data.priority,
      estimatedValue: data.estimatedValue,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate,
      actualCloseDate: data.actualCloseDate,
      contactId: data.contactId,
      assignedToId: data.assignedToId,
    };
    try {
      const response = await salesApi.updateOpportunity(id, request);
      apiLogger.sales({
        endpoint: 'updateOpportunity',
        success: response.success,
        params: { id, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Oportunidad actualizada exitosamente');
        router.push(`/admin/crm/sales/opportunities/${id}`);
      }
    } catch (error: any) {
      apiLogger.sales({
        endpoint: 'updateOpportunity',
        success: false,
        params: { id, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la oportunidad');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingOpportunity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <EmptyState
        title="Oportunidad no encontrada"
        description="La oportunidad que buscas no existe o fue eliminada"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/crm/sales/opportunities/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Oportunidad</h1>
          <p className="text-muted-foreground">Actualiza la información de la oportunidad</p>
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
                <Label htmlFor="title">Título *</Label>
                <Input id="title" placeholder="Ej: Implementación de Splitia para empresa X" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
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
                    <option value="NEW">Nuevo</option>
                    <option value="CONTACTED">Contactado</option>
                    <option value="QUALIFIED">Calificado</option>
                    <option value="DEMO">En demo</option>
                    <option value="PROPOSAL">Propuesta</option>
                    <option value="NEGOTIATION">Negociación</option>
                    <option value="CLOSED_WON">Cerrado ganado</option>
                    <option value="CLOSED_LOST">Cerrado perdido</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Fuente</Label>
                  <select
                    id="source"
                    {...register('source')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="WEB">Web/Formulario</option>
                    <option value="REFERRAL">Referido</option>
                    <option value="EVENT">Evento</option>
                    <option value="PARTNER">Partner</option>
                    <option value="COLD_CALL">Llamada fría</option>
                    <option value="SOCIAL_MEDIA">Redes sociales</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <select
                    id="priority"
                    {...register('priority')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Valoración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Valor Estimado (USD)</Label>
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
                <Label htmlFor="actualCloseDate">Fecha de Cierre Real</Label>
                <Input id="actualCloseDate" type="date" {...register('actualCloseDate')} />
              </div>
              <div className="space-y-2">
                <Label>Probabilidad de Cierre: {probabilityValue}%</Label>
                <Slider
                  value={[probabilityValue]}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Link href={`/admin/crm/sales/opportunities/${id}`}>
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

