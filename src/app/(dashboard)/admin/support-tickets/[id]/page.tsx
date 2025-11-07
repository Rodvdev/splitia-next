'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SupportTicketResponse, UpdateSupportTicketRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, HelpCircle, User, Calendar, Tag, AlertCircle, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

const updateSupportTicketSchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional(),
  description: z.string().min(1, 'La descripción es requerida').optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  resolution: z.string().optional(),
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
      });
    }
  }, [ticket, isEditing, reset]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getSupportTicketById(ticketId);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateSupportTicketFormData) => {
    setIsSaving(true);
    try {
      const request: UpdateSupportTicketRequest = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        resolution: data.resolution,
      };
      const response = await adminApi.updateSupportTicket(ticketId, request);
      if (response.success) {
        toast.success('Ticket actualizado exitosamente');
        setTicket(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
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
      if (response.success) {
        toast.success('Ticket eliminado correctamente');
        router.push('/admin/support-tickets');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el ticket');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      TECHNICAL: 'Técnico',
      BILLING: 'Facturación',
      FEATURE_REQUEST: 'Solicitud',
      BUG_REPORT: 'Error',
      ACCOUNT: 'Cuenta',
      GENERAL: 'General',
    };
    return labels[category] || category;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: 'Abierto',
      IN_PROGRESS: 'En Progreso',
      PENDING_CUSTOMER: 'Pendiente Cliente',
      RESOLVED: 'Resuelto',
      CLOSED: 'Cerrado',
    };
    return labels[status] || status;
  };

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      LOW: 'outline',
      MEDIUM: 'default',
      HIGH: 'secondary',
      URGENT: 'destructive',
    };
    return variants[priority] || 'outline';
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      OPEN: 'default',
      IN_PROGRESS: 'secondary',
      PENDING_CUSTOMER: 'outline',
      RESOLVED: 'default',
      CLOSED: 'outline',
    };
    return variants[status] || 'outline';
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
                    <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Prioridad:</span>
                    <Badge variant={getPriorityVariant(ticket.priority)}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={getStatusVariant(ticket.status)}>
                      {getStatusLabel(ticket.status)}
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
                {ticket.assignedTo && (
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
                <textarea
                  id="description"
                  {...register('description')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <select id="status" {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="OPEN">Abierto</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="PENDING_CUSTOMER">Pendiente Cliente</option>
                    <option value="RESOLVED">Resuelto</option>
                    <option value="CLOSED">Cerrado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <select id="priority" {...register('priority')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolución (opcional)</Label>
                <textarea
                  id="resolution"
                  {...register('resolution')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
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

