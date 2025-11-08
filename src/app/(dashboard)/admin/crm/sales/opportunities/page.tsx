'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { salesApi } from '@/lib/api/sales';
import { OpportunityResponse, OpportunityStage } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, LayoutGrid, Table } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { OpportunityStageBadge } from '@/components/crm/sales/OpportunityStageBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { OpportunityStatsCards } from '@/components/crm/sales/OpportunityStatsCards';
import { WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';
import { useWebSocket } from '@/lib/websocket/WebSocketProvider';

type ViewMode = 'table' | 'kanban';

export default function AdminOpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<OpportunityStage | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    loadOpportunities();
  }, []);

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SALES_OPPORTUNITIES, (message) => {
      const { type, action, entityId, data } = message;
      
      if (type === 'OPPORTUNITY_CREATED' || type === 'OPPORTUNITY_UPDATED') {
        const opportunity = data.opportunity || data as OpportunityResponse;
        setOpportunities((prev) => {
          const existingIndex = prev.findIndex((o) => o.id === opportunity.id);
          if (existingIndex >= 0) {
            // Actualizar existente
            const updated = [...prev];
            updated[existingIndex] = opportunity;
            return updated;
          } else {
            // Agregar nuevo al inicio
            return [opportunity, ...prev];
          }
        });
        
        if (type === 'OPPORTUNITY_CREATED') {
          toast.success(`Nueva oportunidad: ${opportunity.name}`);
        }
      } else if (type === 'OPPORTUNITY_DELETED' || action === 'DELETED') {
        const id = entityId || data.id;
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        toast.info('Oportunidad eliminada');
      } else if (type === 'OPPORTUNITY_STAGE_CHANGED' || action === 'STATUS_CHANGED') {
        const id = entityId || data.id;
        const stage = data.newStage || data.stage;
        setOpportunities((prev) =>
          prev.map((o) => (o.id === id ? { ...o, stage } : o))
        );
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getAllOpportunities({
        page: 0,
        size: 50,
        stage: stageFilter !== 'ALL' ? stageFilter : undefined,
      });
      apiLogger.sales({
        endpoint: 'getAllOpportunities',
        success: response.success,
        params: { page: 0, size: 50, stage: stageFilter },
        data: response.data,
        error: response.success ? null : response,
      });
      const pageData = extractDataFromResponse(response);
      setOpportunities(pageData.content || []);
    } catch (error) {
      apiLogger.sales({
        endpoint: 'getAllOpportunities',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOpportunities();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, stageFilter]);

  const handleDelete = async (id: string) => {
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
        loadOpportunities();
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

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || opp.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const tableHeaders = [
    { label: 'Nombre' },
    { label: 'Etapa' },
    { label: 'Contacto' },
    { label: 'Vendedor' },
    { label: 'Valor Estimado' },
    { label: 'Probabilidad' },
    { label: 'Fecha Cierre' },
    { label: 'Acciones' },
  ];

  const tableRows = filteredOpportunities.map((opp) => [
    <Link
      key={opp.id}
      href={`/admin/crm/sales/opportunities/${opp.id}`}
      className="font-medium text-primary hover:underline"
    >
      {opp.name}
    </Link>,
    <OpportunityStageBadge key={`${opp.id}-stage`} stage={opp.stage} />,
    <span key={`${opp.id}-contact`}>
      {opp.contactName || '-'}
    </span>,
    <span key={`${opp.id}-assigned`}>
      {opp.assignedToName || '-'}
    </span>,
    <span key={`${opp.id}-value`} className="font-medium">
      {formatCurrency(opp.estimatedValue, opp.currency || 'USD')}
    </span>,
    <span key={`${opp.id}-prob`}>{opp.probability}%</span>,
    <span key={`${opp.id}-date`}>
      {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate, 'dd/MM/yyyy') : '-'}
    </span>,
    <DropdownMenu key={`${opp.id}-actions`}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/crm/sales/opportunities/${opp.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/crm/sales/opportunities/${opp.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(opp.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Oportunidades</h1>
          <p className="text-muted-foreground">Gestiona el pipeline de ventas</p>
        </div>
        <Link href="/admin/crm/sales/opportunities/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Oportunidad
          </Button>
        </Link>
      </div>

      <OpportunityStatsCards />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Lista de Oportunidades</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-2" />
                Tabla
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as OpportunityStage | 'ALL')}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todas las etapas</option>
              <option value="LEAD">Lead</option>
              <option value="QUALIFIED">Calificado</option>
              <option value="PROPOSAL">Propuesta</option>
              <option value="NEGOTIATION">Negociación</option>
              <option value="CLOSED_WON">Cerrado ganado</option>
              <option value="CLOSED_LOST">Cerrado perdido</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOpportunities.length === 0 ? (
            <EmptyState
              title="No hay oportunidades"
              description={
                searchTerm || stageFilter !== 'ALL'
                  ? 'No se encontraron oportunidades con esos filtros'
                  : 'No hay oportunidades registradas'
              }
            />
          ) : viewMode === 'table' ? (
            <ResponsiveTable headers={tableHeaders} rows={tableRows} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Vista Kanban - Próximamente
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

