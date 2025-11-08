'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { UserResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, Plus, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers({ page: 0, size: 50 });
      apiLogger.users({
        endpoint: 'getAllUsers',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setUsers(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.users({
        endpoint: 'getAllUsers',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Usuarios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona todos los usuarios del sistema</p>
        </div>
        <Link href="/admin/users/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <EmptyState
              title="No hay usuarios"
              description={searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
            />
          ) : (
            <div className="space-y-4">
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3 pb-3 border-b">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold">
                            {user.name[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name} {user.lastName}</p>
                          {user.phoneNumber && (
                            <p className="text-xs text-muted-foreground truncate">{user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-right break-all">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Moneda:</span>
                          <Badge variant="outline">{user.currency}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Idioma:</span>
                          <Badge variant="outline">{user.language}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registro:</span>
                          <span className="text-right">{formatDate(user.createdAt, 'PP', 'es')}</span>
                        </div>
                        <div className="pt-2">
                          <Link href={`/admin/users/${user.id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                              Ver Detalles
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Moneda</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Idioma</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Registro</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold">
                                {user.name[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name} {user.lastName}</p>
                              {user.phoneNumber && (
                                <p className="text-xs text-muted-foreground">{user.phoneNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{user.currency}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{user.language}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(user.createdAt, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/users/${user.id}`}>
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

