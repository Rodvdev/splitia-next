'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auditApi } from '@/lib/api/audit';
import { AuditLogResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Search, Filter, Download, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { Badge } from '@/components/ui/badge';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    loadLogs();
  }, []);

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    if (!connected) return;

    const isAuditLogResponse = (x: unknown): x is AuditLogResponse => {
      if (!x || typeof x !== 'object') return false;
      const o = x as Partial<AuditLogResponse>;
      return (
        typeof (o as { id?: string }).id === 'string' &&
        typeof (o as { action?: string }).action === 'string' &&
        typeof (o as { entityType?: string }).entityType === 'string' &&
        typeof (o as { userId?: string }).userId === 'string' &&
        typeof (o as { createdAt?: string }).createdAt === 'string'
      );
    };

    const unsubscribe = subscribe(WS_CHANNELS.AUDIT_LOGS, (message) => {
      const { type, action, data } = message;
      
      if (type === 'AUDIT_LOG_CREATED' || action === 'CREATED') {
        const payload = data as unknown;
        const candidate = (payload && typeof payload === 'object' && 'log' in (payload as Record<string, unknown>))
          ? (payload as { log?: unknown }).log
          : payload;
        if (isAuditLogResponse(candidate)) {
          setLogs((prev) => [candidate, ...prev].slice(0, 100));
        }
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getAllAuditLogs({
        page: 0,
        size: 50,
        search: searchTerm || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
      });
      apiLogger.general({
        endpoint: 'getAllAuditLogs',
        success: response.success,
        params: { page: 0, size: 50, search: searchTerm, action: actionFilter, entityType: entityFilter },
        data: response.data,
        error: response.success ? null : response,
      });
      const logsData = extractDataFromResponse(response);
      setLogs(logsData);
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllAuditLogs',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLogs();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, actionFilter, entityFilter]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-500',
    UPDATE: 'bg-blue-500',
    DELETE: 'bg-red-500',
    LOGIN: 'bg-purple-500',
    LOGOUT: 'bg-gray-500',
  };

  const tableHeaders = [
    { label: 'Fecha' },
    { label: 'Usuario' },
    { label: 'Acción' },
    { label: 'Entidad' },
    { label: 'ID Entidad' },
    { label: 'IP' },
  ];

  const tableRows = filteredLogs.map((log) => [
    <span key={`${log.id}-date`}>{formatDate(log.createdAt, 'dd/MM/yyyy HH:mm')}</span>,
    <span key={`${log.id}-user`}>
      {log.user ? `${log.user.name} ${log.user.lastName || ''}` : log.userId}
    </span>,
    <Badge
      key={`${log.id}-action`}
      className={(actionColors[log.action] || 'bg-gray-500') + ' text-white'}
    >
      {log.action}
    </Badge>,
    <span key={`${log.id}-entity`}>{log.entityType}</span>,
    <span key={`${log.id}-entityId`} className="font-mono text-xs">
      {log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}
    </span>,
    <span key={`${log.id}-ip`} className="font-mono text-xs">
      {log.ipAddress || '-'}
    </span>,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Auditoría</h1>
          <p className="text-muted-foreground">Registro de todas las acciones administrativas</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividades</CardTitle>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, acción, entidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todas las acciones</option>
              <option value="CREATE">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todas las entidades</option>
              <option value="User">Usuario</option>
              <option value="Group">Grupo</option>
              <option value="Invoice">Factura</option>
              <option value="Contact">Contacto</option>
              <option value="Opportunity">Oportunidad</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <EmptyState
              title="No hay logs"
              description={
                searchTerm || actionFilter !== 'ALL' || entityFilter !== 'ALL'
                  ? 'No se encontraron logs con esos filtros'
                  : 'No hay registros de auditoría'
              }
            />
          ) : (
            <ResponsiveTable headers={tableHeaders} rows={tableRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

