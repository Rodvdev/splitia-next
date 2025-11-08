'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Calendar, User, DollarSign, Target } from 'lucide-react';
import { useOpportunity } from '@/hooks/useOpportunities';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { OpportunityStageBadge } from '@/components/crm/sales/OpportunityStageBadge';
import { salesApi } from '@/lib/api/sales';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { opportunity, loading } = useOpportunity(id);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta oportunidad?')) return;

    try {
      const response = await salesApi.deleteOpportunity(id);
      apiLogger.sales({
        endpoint: 'deleteOpportunity',
        success: response.success,
        params: { id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Oportunidad eliminada exitosamente');
        router.push('/admin/crm/sales/opportunities');
      }
    } catch (error) {
      apiLogger.sales({
        endpoint: 'deleteOpportunity',
        success: false,
        params: { id },
        error: error,
      });
      toast.error('Error al eliminar la oportunidad');
    }
  };

  if (loading) {
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

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-500',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  };

  const priorityLabels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/crm/sales/opportunities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{opportunity.title}</h1>
            <p className="text-muted-foreground">Detalle de la oportunidad</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/crm/sales/opportunities/${opportunity.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <OpportunityStageBadge stage={opportunity.stage} />
        <Badge className={priorityColors[opportunity.priority] + ' text-white'}>
          {priorityLabels[opportunity.priority]}
        </Badge>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="mt-1">{opportunity.description || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fuente</label>
                  <p className="mt-1">{opportunity.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
                  <p className="mt-1 font-semibold">{formatCurrency(opportunity.estimatedValue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Probabilidad</label>
                  <p className="mt-1">{opportunity.probability}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Cierre Esperada</label>
                  <p className="mt-1">
                    {opportunity.expectedCloseDate
                      ? formatDate(opportunity.expectedCloseDate, 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
                {opportunity.actualCloseDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Cierre Real</label>
                    <p className="mt-1">{formatDate(opportunity.actualCloseDate, 'dd/MM/yyyy')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asignaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunity.contact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <p className="mt-1">
                      {opportunity.contact.name} {opportunity.contact.lastName || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{opportunity.contact.email}</p>
                    {opportunity.contact.company && (
                      <p className="text-sm text-muted-foreground">{opportunity.contact.company}</p>
                    )}
                  </div>
                )}
                {opportunity.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendedor Asignado</label>
                    <p className="mt-1">
                      {opportunity.assignedTo.name} {opportunity.assignedTo.lastName || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{opportunity.assignedTo.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Creado por</span>
                <span className="text-sm">
                  {opportunity.createdBy.name} {opportunity.createdBy.lastName || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de creación</span>
                <span className="text-sm">{formatDate(opportunity.createdAt, 'dd/MM/yyyy HH:mm')}</span>
              </div>
              {opportunity.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Última actualización</span>
                  <span className="text-sm">{formatDate(opportunity.updatedAt, 'dd/MM/yyyy HH:mm')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              {opportunity.activities && opportunity.activities.length > 0 ? (
                <div className="space-y-4">
                  {opportunity.activities.map((activity) => (
                    <div key={activity.id} className="border-l-2 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(activity.date, 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay actividades registradas</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Historial de cambios - Próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

