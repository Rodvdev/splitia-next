'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SupportTicketResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, HelpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSupportTickets({ page: 0, size: 50 });
      apiLogger.support({
        endpoint: 'getAllSupportTickets',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setTickets(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.support({
        endpoint: 'getAllSupportTickets',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <EmptyState
              title="No hay tickets"
              description={searchTerm ? 'No se encontraron tickets con ese criterio' : 'No hay tickets registrados'}
            />
          ) : (
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
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <HelpCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{ticket.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getPriorityVariant(ticket.priority)}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {ticket.createdBy.name} {ticket.createdBy.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(ticket.createdAt, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/support-tickets/${ticket.id}`}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

