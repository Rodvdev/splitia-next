'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { supportApi } from '@/lib/api/support';
import { SupportTicketResponse, Page } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, AlertCircle, CheckCircle, Clock, XCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { apiLogger } from '@/lib/utils/api-logger';

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

const STATUS_COLORS: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  OPEN: 'outline',
  IN_PROGRESS: 'default',
  PENDING_CUSTOMER: 'outline',
  RESOLVED: 'default',
  CLOSED: 'secondary',
};

const PRIORITY_COLORS: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'outline',
  URGENT: 'destructive',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Solicitud',
  BUG_REPORT: 'Error',
  ACCOUNT: 'Cuenta',
  GENERAL: 'General',
};

const PAGE_SIZE = 10;

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, [page]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supportApi.getAll({ page, size: PAGE_SIZE });
      apiLogger.support({
        endpoint: 'getAll',
        success: response.success,
        params: { page, size: PAGE_SIZE },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        const pageData = response.data as Page<SupportTicketResponse>;
        setTickets(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } else {
        setError(response.message || 'Error al cargar los tickets');
        toast.error(response.message || 'Error al cargar los tickets');
      }
    } catch (err) {
      apiLogger.support({
        endpoint: 'getAll',
        success: false,
        params: { page, size: PAGE_SIZE },
        error: err,
      });
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar los tickets';
      setError(errorMessage);
      toast.error(errorMessage);
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
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Soporte</h1>
          <p className="text-muted-foreground">Gestiona tus tickets de soporte</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadTickets} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soporte</h1>
          <p className="text-muted-foreground">Gestiona tus tickets de soporte</p>
        </div>
        <Link href="/dashboard/support/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Ticket
          </Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No hay tickets"
          description="Crea un ticket si necesitas ayuda"
          action={
            <Link href="/dashboard/support/new">
              <Button>Crear Ticket</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const StatusIcon = STATUS_ICONS[ticket.status] || HelpCircle;
              return (
                <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <StatusIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {ticket.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge 
                              variant={STATUS_COLORS[ticket.status] || 'default'}
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
                            <Badge 
                              variant={PRIORITY_COLORS[ticket.priority] || 'default'}
                              className={
                                ticket.priority === 'HIGH' 
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent'
                                  : ''
                              }
                            >
                              {ticket.priority ? PRIORITY_LABELS[ticket.priority] || ticket.priority : 'No especificada'}
                            </Badge>
                            <Badge variant="outline">
                              {CATEGORY_LABELS[ticket.category] || ticket.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Creado: {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                            </span>
                            {ticket.resolvedAt && (
                              <span>
                                Resuelto: {format(new Date(ticket.resolvedAt), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 0) setPage(page - 1);
                    }}
                    className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                  if (
                    pageNum === 0 ||
                    pageNum === totalPages - 1 ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNum);
                          }}
                          isActive={pageNum === page}
                          className="cursor-pointer"
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <span className="px-2">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages - 1) setPage(page + 1);
                    }}
                    className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}

