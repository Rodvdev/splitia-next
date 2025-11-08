'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupUserResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, UserCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminGroupUsersPage() {
  const [groupUsers, setGroupUsers] = useState<GroupUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGroupUsers();
  }, []);

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
      setGroupUsers(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllGroupUsers',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading group users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroupUsers = groupUsers.filter((groupUser) => {
    const term = (searchTerm || '').toLowerCase();
    const groupName = (groupUser?.group?.name || '').toLowerCase();
    const userName = (groupUser?.user?.name || '').toLowerCase();
    const userEmail = (groupUser?.user?.email || '').toLowerCase();
    return (
      groupName.includes(term) ||
      userName.includes(term) ||
      userEmail.includes(term)
    );
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Miembros de Grupos</h1>
          <p className="text-muted-foreground">Gestiona todas las relaciones grupo-usuario</p>
        </div>
        <Link href="/admin/group-users/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Miembro
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por grupo, usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGroupUsers.length === 0 ? (
            <EmptyState
              title="No hay relaciones"
              description={searchTerm ? 'No se encontraron relaciones con ese criterio' : 'No hay relaciones grupo-usuario registradas'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Unión</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroupUsers.map((groupUser) => (
                      <tr key={groupUser.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{groupUser.group.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">
                              {groupUser.user.name} {groupUser.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{groupUser.user.email}</p>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

