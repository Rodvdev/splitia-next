'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { TaskResponse, TaskStatus, TaskPriority } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, CheckSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-gray-500',
  DOING: 'bg-blue-500',
  DONE: 'bg-green-500',
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export default function GroupsTasksTab() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllTasks({ page: 0, size: 50 });
      apiLogger.tasks({
        endpoint: 'getAllTasks',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setTasks(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.tasks({
        endpoint: 'getAllTasks',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesGroup = !groupFilter || !task.group || task.group.id === groupFilter || task.group.name.toLowerCase().includes(groupFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesGroup;
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
            placeholder="Buscar por título, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="ALL">Todos los estados</option>
            <option value="TODO">TODO</option>
            <option value="DOING">DOING</option>
            <option value="DONE">DONE</option>
          </select>
          <Input
            placeholder="Filtrar por grupo..."
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-[200px]"
          />
        </div>
        <Link href="/admin/tasks/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Tarea
          </Button>
        </Link>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No hay tareas"
          description={searchTerm || statusFilter !== 'ALL' || groupFilter ? 'No se encontraron tareas con esos criterios' : 'No hay tareas registradas'}
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Título</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Prioridad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Asignado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Vencimiento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{task.group?.name || 'Sin grupo'}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.assignedTo ? `${task.assignedTo.name} ${task.assignedTo.lastName}` : 'Sin asignar'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {task.dueDate ? formatDate(task.dueDate, 'PP', 'es') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/tasks/${task.id}`}>
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

