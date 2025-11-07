'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { groupsApi } from '@/lib/api/groups';
import { tasksApi } from '@/lib/api/tasks';
import { taskTagsApi } from '@/lib/api/task-tags';
import { GroupResponse, TaskResponse, TaskStatus, TaskTagResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, Filter, CheckSquare } from 'lucide-react';
import { GroupKanban } from '@/components/kanban/GroupKanban';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AllKanbansPage() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedTagId, setSelectedTagId] = useState<string>('all');
  const [tags, setTags] = useState<TaskTagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== 'all') {
      loadTags(selectedGroupId);
    } else {
      setTags([]);
    }
  }, [selectedGroupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await groupsApi.getAll({ page: 0, size: 100 });
      apiLogger.groups({
        endpoint: 'getAll',
        success: response.success,
        params: { page: 0, size: 100 },
        data: response.data,
        error: response.success ? null : response,
      });
      setGroups(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.groups({
        endpoint: 'getAll',
        success: false,
        params: { page: 0, size: 100 },
        error: error,
      });
      console.error('Error loading groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async (groupId: string) => {
    try {
      const response = await taskTagsApi.getTagsByGroup(groupId);
      apiLogger.tags({
        endpoint: 'getTagsByGroup',
        success: response.success,
        params: { groupId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success && response.data) {
        // taskTagsApi.getTagsByGroup devuelve ApiResponse<TaskTagResponse[]>
        // así que response.data es directamente el array
        setTags(Array.isArray(response.data) ? response.data : []);
      } else {
        setTags([]);
      }
    } catch (error) {
      apiLogger.tags({
        endpoint: 'getTagsByGroup',
        success: false,
        params: { groupId },
        error: error,
      });
      console.error('Error loading tags:', error);
    }
  };

  const filteredGroups = (groups || []).filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const displayGroups = selectedGroupId === 'all' ? filteredGroups : filteredGroups.filter((g) => g.id === selectedGroupId);

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
          <h1 className="text-3xl font-bold">Kanban</h1>
          <p className="text-muted-foreground">Gestiona todas las tareas de tus grupos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {(groups || []).map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGroupId !== 'all' && tags.length > 0 && (
              <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por etiqueta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las etiquetas</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
      </Card>

      {displayGroups.length === 0 ? (
        <EmptyState
          title="No hay grupos"
          description={searchTerm ? 'No se encontraron grupos con ese criterio' : 'No tienes grupos disponibles'}
        />
      ) : (
        <div className="space-y-8">
          {displayGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GroupKanban groupId={group.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

