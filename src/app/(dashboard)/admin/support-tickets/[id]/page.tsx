'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SupportTicketResponse, UpdateSupportTicketRequest, UserResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { ArrowLeft, Calendar, Tag, AlertCircle, Edit, Save, X, CheckCircle, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import {
  STATUS_LABELS,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_VARIANTS,
  STATUS_VARIANTS,
} from '@/lib/utils/support-constants';

const updateSupportTicketSchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional(),
  description: z.string().min(1, 'La descripción es requerida').optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  resolution: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
});

type UpdateSupportTicketFormData = z.infer<typeof updateSupportTicketSchema>;

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<SupportTicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateSupportTicketFormData>({
    resolver: zodResolver(updateSupportTicketSchema),
  });

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticket && isEditing) {
      reset({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        resolution: ticket.resolution,
        assignedToId: ticket.assignedTo?.id || null,
      });
    }
  }, [ticket, isEditing, reset]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getSupportTicketById(ticketId);
      apiLogger.support({
        endpoint: 'getSupportTicketById',
        success: response.success,
        params: { id: ticketId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setTicket(response.data);
      } else {
        setError(response.message || 'Error al cargar el ticket');
      }
    } catch (err: any) {
      apiLogger.support({
        endpoint: 'getSupportTicketById',
        success: false,
        params: { id: ticketId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: 'RESOLVE' | 'CLOSE' | 'IN_PROGRESS') => {
    const statusMap = {
      RESOLVE: 'RESOLVED' as const,
      CLOSE: 'CLOSED' as const,
      IN_PROGRESS: 'IN_PROGRESS' as const,
    };
    const status = statusMap[action];
    await handleStatusUpdate(status);
  };

  const handleStatusUpdate = async (status: SupportTicketResponse['status']) => {
    setIsSaving(true);
    try {
      const response = await adminApi.updateSupportTicket(ticketId, { status });
      if (response.success) {
        toast.success(`Ticket ${STATUS_LABELS[status]}`);
        setTicket(response.data);
      } else {
        toast.error('Error al actualizar el ticket');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el ticket');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: UpdateSupportTicketFormData) => {
    setIsSaving(true);
    const request: UpdateSupportTicketRequest = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      resolution: data.resolution,
      assignedToId: data.assignedToId || null,
    };
    try {
      const response = await adminApi.updateSupportTicket(ticketId, request);
      apiLogger.support({
        endpoint: 'updateSupportTicket',
        success: response.success,
        params: { id: ticketId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Ticket actualizado exitosamente');
        setTicket(response.data);
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Error al actualizar el ticket');
      }
    } catch (error: any) {
      apiLogger.support({
        endpoint: 'updateSupportTicket',
        success: false,
        params: { id: ticketId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar el ticket');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteSupportTicket(ticketId);
      apiLogger.support({
        endpoint: 'deleteSupportTicket',
        success: response.success,
        params: { id: ticketId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Ticket eliminado correctamente');
        router.push('/admin/support-tickets');
      } else {
        toast.error(response.message || 'Error al eliminar el ticket');
      }
    } catch (err: any) {
      apiLogger.support({
        endpoint: 'deleteSupportTicket',
        success: false,
        params: { id: ticketId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar el ticket');
    } finally {
      setIsDeleting(false);
    }
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

  if (!ticket) {
    return <ErrorMessage message="Ticket no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/support-tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{ticket.title}</h1>
            <p className="text-muted-foreground">Detalle del ticket de soporte</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
              <Button
                variant="outline"
                onClick={() => handleQuickAction('RESOLVE')}
                disabled={isSaving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Resuelto
              </Button>
            )}
            {ticket.status !== 'CLOSED' && (
              <Button
                variant="outline"
                onClick={() => handleQuickAction('CLOSE')}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar Ticket
              </Button>
            )}
            {ticket.status === 'OPEN' && (
              <Button
                variant="outline"
                onClick={() => handleQuickAction('IN_PROGRESS')}
                disabled={isSaving}
              >
                <Clock className="h-4 w-4 mr-2" />
                En Progreso
              </Button>
            )}
          </div>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{ticket.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Descripción</p>
                    <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Categoría:</span>
                    <Badge variant="outline">{CATEGORY_LABELS[ticket.category] || ticket.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Prioridad:</span>
                    <Badge variant={PRIORITY_VARIANTS[ticket.priority] || 'outline'}>
                      {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={STATUS_VARIANTS[ticket.status] || 'outline'}>
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Creado: {formatDate(ticket.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                  {ticket.resolvedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Resuelto: {formatDate(ticket.resolvedAt, 'PP', 'es')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Creado por</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {ticket.createdBy.name[0]}{ticket.createdBy.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {ticket.createdBy.name} {ticket.createdBy.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{ticket.createdBy.email}</p>
                    </div>
                  </div>
                </div>
                {ticket.assignedTo ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Asignado a</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {ticket.assignedTo.name[0]}{ticket.assignedTo.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {ticket.assignedTo.name} {ticket.assignedTo.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{ticket.assignedTo.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Asignado a</p>
                    <p className="text-sm text-muted-foreground">Sin asignar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {ticket.resolution && (
            <Card>
              <CardHeader>
                <CardTitle>Resolución</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{ticket.resolution}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Ticket
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Ticket'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="min-h-[100px]"
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Abierto</SelectItem>
                          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                          <SelectItem value="PENDING_CUSTOMER">Pendiente Cliente</SelectItem>
                          <SelectItem value="RESOLVED">Resuelto</SelectItem>
                          <SelectItem value="CLOSED">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToId">Asignado a (opcional)</Label>
                <Controller
                  name="assignedToId"
                  control={control}
                  render={({ field }) => (
                    <AsyncPaginatedSelect<UserResponse>
                      value={field.value || undefined}
                      onChange={(value) => field.onChange(value || null)}
                      placeholder="Seleccionar usuario"
                      getOptionLabel={(u) => `${u.name} ${u.lastName} (${u.email})`}
                      getOptionValue={(u) => u.id}
                      fetchPage={async (page, size) => {
                        const res = await adminApi.getAllUsers({ page, size });
                        const data = res.data as any;
                        return {
                          items: Array.isArray(data?.content) ? (data.content as UserResponse[]) : [],
                          total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                        };
                      }}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Deja vacío para desasignar el ticket
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolución (opcional)</Label>
                <Textarea
                  id="resolution"
                  {...register('resolution')}
                  className="min-h-[100px]"
                  rows={4}
                  placeholder="Describe la resolución del ticket..."
                />
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
