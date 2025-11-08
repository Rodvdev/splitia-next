'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SettlementResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllSettlements({ page: 0, size: 50 });
      apiLogger.settlements({
        endpoint: 'getAllSettlements',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      
      if (!response.success) {
        const status = (response as any).status || (response as any).response?.status;
        if (status === 403) {
          setError('No tienes permisos para acceder a las liquidaciones. Contacta con un administrador si necesitas acceso.');
        } else {
          setError((response as any).message || 'Error al cargar las liquidaciones');
        }
        return;
      }
      
      setSettlements(extractDataFromResponse(response));
    } catch (err: any) {
      apiLogger.settlements({
        endpoint: 'getAllSettlements',
        success: false,
        params: { page: 0, size: 50 },
        error: err,
      });
      
      const status = err?.response?.status;
      if (status === 403) {
        setError('No tienes permisos para acceder a las liquidaciones. Contacta con un administrador si necesitas acceso.');
      } else if (status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err?.response?.data?.message || 'Error al cargar las liquidaciones');
      }
      console.error('Error loading settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter(
    (settlement) =>
      settlement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.initiatedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.settledWithUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      PENDING_CONFIRMATION: 'Pendiente Confirmación',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PAYMENT: 'Pago',
      RECEIPT: 'Recibo',
    };
    return labels[type] || type;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      PENDING: 'outline',
      PENDING_CONFIRMATION: 'secondary',
      CONFIRMED: 'default',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Liquidaciones</h1>
            <p className="text-muted-foreground">Gestiona todas las liquidaciones del sistema</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Error al cargar liquidaciones"
              description={error}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidaciones</h1>
          <p className="text-muted-foreground">Gestiona todas las liquidaciones del sistema</p>
        </div>
        <Link href="/admin/settlements/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Liquidación
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSettlements.length === 0 ? (
            <EmptyState
              title="No hay liquidaciones"
              description={searchTerm ? 'No se encontraron liquidaciones con ese criterio' : 'No hay liquidaciones registradas'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Moneda</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Iniciado por</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{formatCurrency(settlement.amount, settlement.currency, 'es')}</p>
                              {settlement.description && (
                                <p className="text-xs text-muted-foreground">{settlement.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{settlement.currency}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(settlement.status)}>
                            {getStatusLabel(settlement.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{getTypeLabel(settlement.type)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {settlement.initiatedBy.name} {settlement.initiatedBy.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(settlement.date, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/settlements/${settlement.id}`}>
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

