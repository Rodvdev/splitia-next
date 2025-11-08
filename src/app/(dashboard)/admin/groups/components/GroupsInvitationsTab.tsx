'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupInvitationResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Search, MoreVertical, UserPlus, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function GroupsInvitationsTab() {
  const [invitations, setInvitations] = useState<GroupInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllGroupInvitations({ page: 0, size: 50 });
      apiLogger.general({
        endpoint: 'getAllGroupInvitations',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setInvitations(extractDataFromResponse(response));
    } catch (err: any) {
      apiLogger.general({
        endpoint: 'getAllGroupInvitations',
        success: false,
        params: { page: 0, size: 50 },
        error: err,
      });
      
      const status = err?.response?.status;
      if (status === 403) {
        setError('No tienes permisos para acceder a las invitaciones de grupos. Contacta con un administrador si necesitas acceso.');
      } else if (status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err?.response?.data?.message || 'Error al cargar las invitaciones de grupos');
      }
      console.error('Error loading group invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvitations = invitations.filter((invitation) => {
    const term = (searchTerm || '').toLowerCase();
    const groupName = (invitation?.group?.name || '').toLowerCase();
    const invitedByName = (invitation?.invitedBy?.name || '').toLowerCase();
    const invitedEmail = (invitation?.email || '').toLowerCase();
    const invitedUserName = (invitation?.invitedUser?.name || '').toLowerCase();
    return (
      groupName.includes(term) ||
      invitedByName.includes(term) ||
      invitedEmail.includes(term) ||
      invitedUserName.includes(term)
    );
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptada',
      REJECTED: 'Rechazada',
      EXPIRED: 'Expirada',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      PENDING: 'outline',
      ACCEPTED: 'default',
      REJECTED: 'destructive',
      EXPIRED: 'outline',
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por grupo, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/admin/group-invitations/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Invitación
          </Button>
        </Link>
      </div>

      {filteredInvitations.length === 0 ? (
        <EmptyState
          title="No hay invitaciones"
          description={searchTerm ? 'No se encontraron invitaciones con ese criterio' : 'No hay invitaciones registradas'}
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Invitado por</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email/Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.group?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {invitation.invitedBy?.name || 'N/A'} {invitation.invitedBy?.lastName || ''}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {invitation.invitedUser ? (
                      <span>{invitation.invitedUser.email}</span>
                    ) : (
                      <span className="text-muted-foreground">{invitation.email || 'N/A'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(invitation.status)}>
                      {getStatusLabel(invitation.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(invitation.createdAt, 'PP', 'es')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/group-invitations/${invitation.id}`}>
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
      )}
    </div>
  );
}

