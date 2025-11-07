'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SupportTicketResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, HelpCircle, User, Calendar, Tag, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<SupportTicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

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

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await adminApi.deleteSupportTicket(ticketId);
      if (response.success) {
        toast.success('Ticket eliminado correctamente');
        router.push('/admin/support-tickets');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el ticket');
    } finally {
      setDeleting(false);
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar Ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

