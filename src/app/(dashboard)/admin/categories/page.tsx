'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { CategoryResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, Tag, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllCategories({ page: 0, size: 50 });
      apiLogger.categories({
        endpoint: 'getAllCategories',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      
      if (!response.success) {
        const status = (response as any).status || (response as any).response?.status;
        if (status === 403) {
          setError('No tienes permisos para acceder a las categorías. Contacta con un administrador si necesitas acceso.');
        } else {
          setError((response as any).message || 'Error al cargar las categorías');
        }
        return;
      }
      
      setCategories(extractDataFromResponse(response));
    } catch (err: any) {
      apiLogger.categories({
        endpoint: 'getAllCategories',
        success: false,
        params: { page: 0, size: 50 },
        error: err,
      });
      
      const status = err?.response?.status;
      if (status === 403) {
        setError('No tienes permisos para acceder a las categorías. Contacta con un administrador si necesitas acceso.');
      } else if (status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err?.response?.data?.message || 'Error al cargar las categorías');
      }
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold">Categorías</h1>
            <p className="text-muted-foreground">Gestiona todas las categorías del sistema</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Error al cargar categorías"
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
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">Gestiona todas las categorías del sistema</p>
        </div>
        <Link href="/admin/categories/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Categoría
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <EmptyState
              title="No hay categorías"
              description={searchTerm ? 'No se encontraron categorías con ese criterio' : 'No hay categorías registradas'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Icono</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Color</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Creado por</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono text-muted-foreground">{category.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                              {category.icon ? (
                                <span className="text-2xl">{category.icon}</span>
                              ) : (
                                <Tag className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {category.icon ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{category.icon}</span>
                              <span className="text-xs text-muted-foreground font-mono">{category.icon}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin icono</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {category.color ? (
                            <div className="flex items-center gap-3">
                              <div
                                className="h-8 w-8 rounded-lg border-2 shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <div>
                                <p className="text-xs font-medium">{category.color}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin color</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {category.groupName ? (
                            <Link href={`/admin/groups/${category.groupId}`} className="text-sm text-primary hover:underline">
                              {category.groupName}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">{category.groupId}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {category.createdByName ? (
                            <span className="text-sm">{category.createdByName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">{category.createdById}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(category.createdAt, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/categories/${category.id}`}>
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

