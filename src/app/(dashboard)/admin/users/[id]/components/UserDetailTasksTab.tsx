'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { TaskResponse, TaskStatus, TaskPriority } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckSquare, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { Button } from '@/components/ui/button';

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

export default function UserDetailTasksTab({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [userId]);

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
      const allTasks = extractDataFromResponse(response);
      // Filter tasks for this user (assigned to)
      const userTasks = allTasks.filter(task => task.assignedTo?.id === userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState title="No hay tareas" description="Este usuario no tiene tareas asignadas" />;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Título</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Prioridad</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Vencimiento</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
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
  );
}

