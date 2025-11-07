'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupInvitationResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';

export default function AdminGroupInvitationsPage() {
  const [invitations, setInvitations] = useState<GroupInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllGroupInvitations({ page: 0, size: 50 });
      if (response.success) {
        setInvitations(response.data.content);
      }
    } catch (error) {
      console.error('Error loading group invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvitations = invitations.filter(
    (invitation) =>
      invitation.group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.invitedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.invitedUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitaciones a Grupos</h1>
          <p className="text-muted-foreground">Gestiona todas las invitaciones a grupos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por grupo, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvitations.length === 0 ? (
            <EmptyState
              title="No hay invitaciones"
              description={searchTerm ? 'No se encontraron invitaciones con ese criterio' : 'No hay invitaciones registradas'}
            />
          ) : (
            <div className="space-y-4">
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
                              <p className="font-medium">{invitation.group.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {invitation.invitedBy.name} {invitation.invitedBy.lastName}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

