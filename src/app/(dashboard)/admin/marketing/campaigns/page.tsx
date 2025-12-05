'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignResponse, CampaignStatus, CampaignType } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, Send, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { marketingApi } from '@/lib/api/marketing';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

export default function MarketingCampaignsPage() {
  const router = useRouter();
  const { campaigns, loading, refetch } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    refetch({ page: 0, size: 50 });
  }, [searchTerm, refetch]);

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    if (!connected) return;

    const isCampaignResponse = (x: unknown): x is CampaignResponse => {
      if (!x || typeof x !== 'object') return false;
      const o = x as Partial<CampaignResponse>;
      return (
        typeof (o as { id?: string }).id === 'string' &&
        typeof (o as { name?: string }).name === 'string' &&
        typeof (o as { type?: string }).type === 'string' &&
        typeof (o as { status?: string }).status === 'string'
      );
    };

    const unsubscribe = subscribe('/topic/marketing/campaigns', (message) => {
      const { type, data } = message;
      
      if (type === 'CAMPAIGN_CREATED' || type === 'CAMPAIGN_UPDATED') {
        const payload = data as unknown;
        const candidate = (payload && typeof payload === 'object' && 'campaign' in (payload as Record<string, unknown>))
          ? (payload as { campaign?: unknown }).campaign
          : payload;
        if (isCampaignResponse(candidate)) {
          refetch();
          if (type === 'CAMPAIGN_CREATED') {
            toast.success(`Nueva campaña: ${candidate.name}`);
          }
        }
      } else if (type === 'CAMPAIGN_DELETED') {
        refetch();
        toast.info('Campaña eliminada');
      } else if (type === 'CAMPAIGN_STATUS_CHANGED') {
        refetch();
      }
    });

    return unsubscribe;
  }, [subscribe, connected, refetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta campaña?')) return;

    try {
      const response = await marketingApi.deleteCampaign(id);
      if (response.success) {
        toast.success('Campaña eliminada exitosamente');
        refetch();
      }
    } catch (error) {
      toast.error('Error al eliminar la campaña');
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<CampaignStatus, string> = {
    DRAFT: 'bg-gray-500',
    SCHEDULED: 'bg-blue-500',
    RUNNING: 'bg-green-500',
    PAUSED: 'bg-yellow-500',
    COMPLETED: 'bg-purple-500',
    CANCELLED: 'bg-red-500',
  };

  const statusLabels: Record<CampaignStatus, string> = {
    DRAFT: 'Borrador',
    SCHEDULED: 'Programada',
    RUNNING: 'En ejecución',
    PAUSED: 'Pausada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const headers = [
    { label: 'Nombre' },
    { label: 'Tipo' },
    { label: 'Estado' },
    { label: 'Programada' },
    { label: 'Enviada' },
    { label: 'Acciones', className: 'w-[80px] text-right' },
  ];

  const rows = filteredCampaigns.map((campaign) => [
    <Link
      key={`${campaign.id}-name`}
      href={`/admin/marketing/campaigns/${campaign.id}`}
      className="text-primary hover:underline font-medium"
    >
      {campaign.name}
    </Link>,
    <span key={`${campaign.id}-type`}>{campaign.type}</span>,
    <Badge
      key={`${campaign.id}-status`}
      className={statusColors[campaign.status] + ' text-white'}
    >
      {statusLabels[campaign.status]}
    </Badge>,
    <span key={`${campaign.id}-scheduled`}>
      {campaign.scheduledAt ? formatDate(campaign.scheduledAt) : '-'}
    </span>,
    <span key={`${campaign.id}-sent`}>
      {campaign.sentAt ? formatDate(campaign.sentAt) : '-'}
    </span>,
    <DropdownMenu key={`${campaign.id}-actions`}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/marketing/campaigns/${campaign.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/marketing/campaigns/${campaign.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-destructive">
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
          <h1 className="text-3xl font-bold">Campañas de Marketing</h1>
          <p className="text-muted-foreground">Gestiona tus campañas de email y marketing</p>
        </div>
        <Link href="/admin/marketing/campaigns/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Campaña
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Campañas</CardTitle>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="SCHEDULED">Programada</option>
              <option value="RUNNING">En ejecución</option>
              <option value="PAUSED">Pausada</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <EmptyState
              title="No hay campañas"
              description={
                searchTerm || statusFilter !== 'ALL'
                  ? 'No se encontraron campañas con esos filtros'
                  : 'Comienza creando tu primera campaña de marketing'
              }
              action={
                !searchTerm && statusFilter === 'ALL' ? (
                  <Link href="/admin/marketing/campaigns/create">
                    <Button>Crear Campaña</Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <ResponsiveTable headers={headers} rows={rows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

