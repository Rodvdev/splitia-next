'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupInvitationResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { UserPlus, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { Button } from '@/components/ui/button';

export default function GroupDetailInvitationsTab({ groupId }: { groupId: string }) {
  const [invitations, setInvitations] = useState<GroupInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, [groupId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllGroupInvitations({ page: 0, size: 50 });
      apiLogger.general({
        endpoint: 'getAllGroupInvitations',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      const allInvitations = extractDataFromResponse(response);
      // Filter invitations for this group
      const groupInvitations = allInvitations.filter(invitation => invitation.group?.id === groupId);
      setInvitations(groupInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (invitations.length === 0) {
    return <EmptyState title="No hay invitaciones" description="Este grupo no tiene invitaciones registradas" />;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Invitado por</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email/Usuario</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation) => (
            <tr key={invitation.id} className="border-b hover:bg-muted/50 transition-colors">
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
  );
}

