'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { adminApi } from '@/lib/api/admin';
import { SupportTicketResponse, Page } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, HelpCircle, Plus, Filter, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { toast } from 'sonner';
import {
  STATUS_LABELS,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_VARIANTS,
  STATUS_VARIANTS,
} from '@/lib/utils/support-constants';

const PAGE_SIZE = 20;

type StatusFilter = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'ALL';
type CategoryFilter = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'ACCOUNT' | 'GENERAL' | 'ALL';
type PriorityFilter = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'ALL';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    loadTickets();
  }, [page]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSupportTickets({ page, size: PAGE_SIZE });
      apiLogger.support({
        endpoint: 'getAllSupportTickets',
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
      }
    } catch (error) {
      apiLogger.support({
        endpoint: 'getAllSupportTickets',
        success: false,
        params: { page, size: PAGE_SIZE },
        error: error,
      });
      console.error('Error loading support tickets:', error);
      toast.error('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (ticketId: string, newStatus: SupportTicketResponse['status']) => {
    try {
      const response = await adminApi.updateSupportTicket(ticketId, { status: newStatus });
      if (response.success) {
        toast.success(`Ticket ${STATUS_LABELS[newStatus]}`);
        loadTickets();
      } else {
        toast.error('Error al actualizar el ticket');
      }
    } catch (error) {
      toast.error('Error al actualizar el ticket');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
      const matchesUser =
        !userFilter ||
        `${ticket.createdBy.name} ${ticket.createdBy.lastName}`.toLowerCase().includes(userFilter.toLowerCase()) ||
        ticket.createdBy.email.toLowerCase().includes(userFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesUser;
    });
  }, [tickets, searchTerm, statusFilter, categoryFilter, priorityFilter, userFilter]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const urgent = tickets.filter((t) => t.priority === 'URGENT').length;
    return { total, open, inProgress, resolved, urgent };
  }, [tickets]);

  const hasActiveFilters = statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL' || userFilter !== '';

  const clearFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setUserFilter('');
    setSearchTerm('');
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets de Soporte</h1>
          <p className="text-muted-foreground">Gestiona todos los tickets de soporte</p>
        </div>
        <Link href="/admin/support-tickets/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Ticket
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Abiertos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Urgentes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="OPEN">Abierto</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="PENDING_CUSTOMER">Pendiente Cliente</SelectItem>
                  <SelectItem value="RESOLVED">Resuelto</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las categorías</SelectItem>
                  <SelectItem value="TECHNICAL">Técnico</SelectItem>
                  <SelectItem value="BILLING">Facturación</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Solicitud</SelectItem>
                  <SelectItem value="BUG_REPORT">Error</SelectItem>
                  <SelectItem value="ACCOUNT">Cuenta</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las prioridades</SelectItem>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filtrar por usuario..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-[200px]"
              />
              {hasActiveFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters} title="Limpiar filtros">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <EmptyState
              title="No hay tickets"
              description={
                hasActiveFilters || searchTerm
                  ? 'No se encontraron tickets con esos criterios'
                  : 'No hay tickets registrados'
              }
            />
          ) : (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Título</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Prioridad</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Creado por</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/admin/support-tickets/${ticket.id}`} className="block">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <HelpCircle className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium hover:underline">{ticket.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{CATEGORY_LABELS[ticket.category] || ticket.category}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={PRIORITY_VARIANTS[ticket.priority] || 'outline'}>
                              {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_VARIANTS[ticket.status] || 'outline'}>
                              {STATUS_LABELS[ticket.status] || ticket.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {ticket.createdBy.name} {ticket.createdBy.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(ticket.createdAt, 'PP', 'es')}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/support-tickets/${ticket.id}`}>Ver detalles</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleQuickStatusChange(ticket.id, 'OPEN')}
                                  disabled={ticket.status === 'OPEN'}
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Marcar como Abierto
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuickStatusChange(ticket.id, 'IN_PROGRESS')}
                                  disabled={ticket.status === 'IN_PROGRESS'}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Marcar como En Progreso
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuickStatusChange(ticket.id, 'RESOLVED')}
                                  disabled={ticket.status === 'RESOLVED'}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Resuelto
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuickStatusChange(ticket.id, 'CLOSED')}
                                  disabled={ticket.status === 'CLOSED'}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cerrar Ticket
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
