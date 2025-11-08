'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supportApi } from '@/lib/api/support';
import { SupportTicketResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Calendar, Tag, AlertCircle, HelpCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Solicitud',
  BUG_REPORT: 'Error',
  ACCOUNT: 'Cuenta',
  GENERAL: 'General',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  PENDING_CUSTOMER: 'Esperando Cliente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  PENDING_CUSTOMER: Clock,
  RESOLVED: CheckCircle,
  CLOSED: XCircle,
};

const PRIORITY_VARIANTS: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  LOW: 'outline',
  MEDIUM: 'default',
  HIGH: 'secondary',
  URGENT: 'destructive',
};

const STATUS_VARIANTS: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  OPEN: 'default',
  IN_PROGRESS: 'secondary',
  PENDING_CUSTOMER: 'outline',
  RESOLVED: 'default',
  CLOSED: 'outline',
};

export default function SupportTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<SupportTicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supportApi.getById(ticketId);
      apiLogger.support({
        endpoint: 'getById',
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
        endpoint: 'getById',
        success: false,
        params: { id: ticketId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar el ticket');
    } finally {
      setLoading(false);
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

  const StatusIcon = STATUS_ICONS[ticket.status] || HelpCircle;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
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
                {ticket.priority ? (
                  <Badge variant={PRIORITY_VARIANTS[ticket.priority] || 'outline'}>
                    {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                  </Badge>
                ) : (
                  <Badge variant="outline">No especificada</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estado:</span>
                <Badge 
                  variant={STATUS_VARIANTS[ticket.status] || 'outline'}
                  className={
                    ticket.status === 'OPEN' || ticket.status === 'PENDING_CUSTOMER' 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent' 
                      : ticket.status === 'RESOLVED' 
                      ? 'bg-green-500 hover:bg-green-600 text-white border-transparent'
                      : ''
                  }
                >
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
            <CardTitle>Información del Usuario</CardTitle>
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
    </div>
  );
}

