'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { TaskTagResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, Tag, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function GroupsTagsTab() {
  const [tags, setTags] = useState<TaskTagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllTaskTags({ page: 0, size: 50 });
      apiLogger.tags({
        endpoint: 'getAllTaskTags',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setTags(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.tags({
        endpoint: 'getAllTaskTags',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading task tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = !groupFilter || tag.group.id === groupFilter || tag.group.name.toLowerCase().includes(groupFilter.toLowerCase());
    return matchesSearch && matchesGroup;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          placeholder="Filtrar por grupo..."
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="w-[200px]"
        />
        <Link href="/admin/task-tags/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Etiqueta
          </Button>
        </Link>
      </div>

      {filteredTags.length === 0 ? (
        <EmptyState
          title="No hay etiquetas"
          description={searchTerm || groupFilter ? 'No se encontraron etiquetas con esos criterios' : 'No hay etiquetas registradas'}
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Color</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tag.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-xs">{tag.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{tag.group.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(tag.createdAt, 'PP', 'es')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/task-tags/${tag.id}`}>
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

