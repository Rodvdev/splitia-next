'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupUserResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Users, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { Button } from '@/components/ui/button';

export default function UserDetailGroupsTab({ userId }: { userId: string }) {
  const [groupUsers, setGroupUsers] = useState<GroupUserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupUsers();
  }, [userId]);

  const loadGroupUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllGroupUsers({ page: 0, size: 50 });
      apiLogger.general({
        endpoint: 'getAllGroupUsers',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      const allGroupUsers = extractDataFromResponse(response);
      // Filter group users for this user
      const userGroups = allGroupUsers.filter(groupUser => groupUser.user?.id === userId);
      setGroupUsers(userGroups);
    } catch (error) {
      console.error('Error loading group users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      MEMBER: 'Miembro',
      GUEST: 'Invitado',
      ASSISTANT: 'Asistente',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (groupUsers.length === 0) {
    return <EmptyState title="No hay grupos" description="Este usuario no pertenece a ningún grupo" />;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Unión</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {groupUsers.map((groupUser) => (
            <tr key={groupUser.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{groupUser.group?.name || 'Sin grupo'}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{getRoleLabel(groupUser.role)}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(groupUser.joinedAt, 'PP', 'es')}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/group-users/${groupUser.id}`}>
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

