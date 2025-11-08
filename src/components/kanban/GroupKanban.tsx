'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tasksApi } from '@/lib/api/tasks';
import { apiLogger } from '@/lib/utils/api-logger';
import { TaskResponse, TaskStatus, TaskPriority } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Plus, Calendar, User, Tag as TagIcon, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface TaskCardProps {
  task: TaskResponse;
  onDelete?: (task: TaskResponse) => void;
}

function TaskCard({ task, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasFutureExpense = !!(task.expenseId || task.futureExpenseAmount);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing mb-2 w-full"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <h4 className="font-semibold mb-2 flex-1">{task.title}</h4>
          {onDelete && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              title="Eliminar tarea"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(task);
              }}
            >
              {/* Using lucide 'Trash' icon via import at top */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
            </Button>
          )}
        </div>
        {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
          {task.tags.map((tag) => (
            <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-white">
              {tag.name}
            </Badge>
          ))}
          {hasFutureExpense && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {task.futureExpenseAmount && formatCurrency(task.futureExpenseAmount, task.futureExpenseCurrency || 'USD')}
              {task.expenseId && 'Linked'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.assignedTo.name}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate, 'PP', 'es')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskResponse[];
  page: number;
  pageSize: number;
  onChangePage: (status: TaskStatus, page: number) => void;
  onTaskClick?: (task: TaskResponse) => void;
  onDeleteTask?: (task: TaskResponse) => void;
}

function KanbanColumn({ status, tasks, page, pageSize, onChangePage, onTaskClick, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Paginación: usamos el orden tal cual llega del backend/estado local.
  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleTasks = tasks.slice(start, start + pageSize);

  const sortableTasks = visibleTasks.map((task) => task.id);

  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-[320px] sm:w-[280px] md:w-[320px] ${isOver ? 'bg-muted/50 rounded-lg p-2' : ''}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg capitalize">{status}</h3>
          <Badge className={statusColors[status]}>{tasks.length}</Badge>
        </div>
      </div>
      <SortableContext id={status} items={sortableTasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px]">
          {visibleTasks.map((task) => (
            <div key={task.id} onClick={() => onTaskClick?.(task)}>
              <TaskCard task={task} onDelete={onDeleteTask} />
            </div>
          ))}
        </div>
      </SortableContext>
      {/* Paginación simple */}
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onChangePage(status, Math.max(1, currentPage - 1))}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onChangePage(status, Math.min(totalPages, currentPage + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

interface GroupKanbanProps {
  groupId: string;
  onCreateTask?: () => void;
}

export function GroupKanban({ groupId, onCreateTask }: GroupKanbanProps) {
  const [tasks, setTasks] = useState<Record<TaskStatus, TaskResponse[]>>({
    TODO: [],
    DOING: [],
    DONE: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pageByStatus, setPageByStatus] = useState<Record<TaskStatus, number>>({
    TODO: 1,
    DOING: 1,
    DONE: 1,
  });
  const pageSize = 3;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Evita que un simple click dispare drag; requiere un pequeño movimiento
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTasks();
  }, [groupId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [todoRes, doingRes, doneRes] = await Promise.all([
        tasksApi.getTasksByGroupAndStatus(groupId, 'TODO'),
        tasksApi.getTasksByGroupAndStatus(groupId, 'DOING'),
        tasksApi.getTasksByGroupAndStatus(groupId, 'DONE'),
      ]);

      // Extraer lista sin importar si la API devuelve arreglo plano o paginado (data.content)
      const extractList = (res: any): TaskResponse[] => {
        if (!res?.success) return [];
        const d = res.data;
        if (Array.isArray(d)) return d as TaskResponse[];
        if (d && Array.isArray(d.content)) return d.content as TaskResponse[];
        return [];
      };

      setTasks({
        TODO: extractList(todoRes),
        DOING: extractList(doingRes),
        DONE: extractList(doneRes),
      });

      // Logging para diagnóstico de respuestas de API
      apiLogger.tasks({ endpoint: 'getTasksByGroupAndStatus/TODO', success: todoRes.success, params: { groupId, status: 'TODO' }, data: todoRes.data, error: todoRes.success ? null : todoRes });
      apiLogger.tasks({ endpoint: 'getTasksByGroupAndStatus/DOING', success: doingRes.success, params: { groupId, status: 'DOING' }, data: doingRes.data, error: doingRes.success ? null : doingRes });
      apiLogger.tasks({ endpoint: 'getTasksByGroupAndStatus/DONE', success: doneRes.success, params: { groupId, status: 'DONE' }, data: doneRes.data, error: doneRes.success ? null : doneRes });
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      apiLogger.tasks({ endpoint: 'getTasksByGroupAndStatus/*', success: false, params: { groupId }, error });
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('No autorizado para cargar tareas de este grupo/estado. Verifica permisos.');
      } else if (status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        toast.error('Error al cargar las tareas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;

    // dnd-kit: cuando se suelta sobre una lista con items, over.id suele ser el ID del item "sobre el que caímos".
    // Para obtener la columna/droppable correcta usamos containerId. Si no está, validamos si over.id es directamente un estado.
    const overContainerId = (over.data?.current as any)?.sortable?.containerId as string | undefined;
    const validStatuses: TaskStatus[] = ['TODO', 'DOING', 'DONE'];
    let newStatus: TaskStatus | undefined = undefined;

    if (overContainerId && (validStatuses as string[]).includes(overContainerId)) {
      newStatus = overContainerId as TaskStatus;
    } else {
      const overIdStr = over.id as string | undefined;
      if (overIdStr && (validStatuses as string[]).includes(overIdStr)) {
        newStatus = overIdStr as TaskStatus;
      }
    }

    if (!newStatus) {
      // No pudimos determinar la columna destino; evitar crash y loguear
      apiLogger.tasks({
        endpoint: 'dnd/resolveNewStatus',
        success: false,
        params: { taskId, overId: over.id, overContainerId },
        error: 'No valid drop containerId detected',
      });
      return;
    }

    // Find the task
    let task: TaskResponse | undefined;
    let oldStatus: TaskStatus | undefined;

    for (const [status, statusTasks] of Object.entries(tasks)) {
      const found = statusTasks.find((t) => t.id === taskId);
      if (found) {
        task = found;
        oldStatus = status as TaskStatus;
        break;
      }
    }

    if (!task || !oldStatus || oldStatus === newStatus) return;

    // Keep a snapshot to revert on error without hitting the backend
    const prevSnapshot: Record<TaskStatus, TaskResponse[]> = {
      TODO: [...(Array.isArray(tasks.TODO) ? tasks.TODO : [])],
      DOING: [...(Array.isArray(tasks.DOING) ? tasks.DOING : [])],
      DONE: [...(Array.isArray(tasks.DONE) ? tasks.DONE : [])],
    };

    try {

      // Optimistic update
      const newTasks = { ...tasks };
      newTasks[oldStatus] = Array.isArray(newTasks[oldStatus])
        ? newTasks[oldStatus].filter((t) => t.id !== taskId)
        : [];
      // Insertamos al inicio de la columna destino para que aparezca en la primera página
      newTasks[newStatus] = Array.isArray(newTasks[newStatus])
        ? [{ ...task, status: newStatus }, ...newTasks[newStatus]]
        : [{ ...task, status: newStatus }];
      setTasks(newTasks);

      // Update in backend
      const updateRes = await tasksApi.updateTask(taskId, { status: newStatus });
      apiLogger.tasks({
        endpoint: 'updateTask/status',
        success: updateRes?.success ?? true,
        params: { taskId, from: oldStatus, to: newStatus },
        data: updateRes?.data,
        error: updateRes?.success ? null : updateRes,
      });

      // Al mover, llevamos a la primera página de la columna destino para ver la tarjeta
      setPageByStatus((prev) => ({ ...prev, [newStatus!]: 1 }));
      
      // Show message if task was moved to DONE and has future expense
      if (newStatus === 'DONE' && (task.futureExpenseAmount || task.expenseId)) {
        toast.success('Tarea completada. El gasto futuro se ha convertido en gasto real.');
      } else {
        toast.success('Tarea actualizada');
      }
    } catch (error: any) {
      // Revert on error using local snapshot (avoid extra GET that may also fail)
      setTasks((_) => ({
        TODO: [...(Array.isArray(prevSnapshot.TODO) ? prevSnapshot.TODO : [])],
        DOING: [...(Array.isArray(prevSnapshot.DOING) ? prevSnapshot.DOING : [])],
        DONE: [...(Array.isArray(prevSnapshot.DONE) ? prevSnapshot.DONE : [])],
      }));

      // Log error details to help diagnose (403 typically = permisos/CSRF/backend policy)
      apiLogger.tasks({
        endpoint: 'updateTask/status',
        success: false,
        params: { taskId, from: oldStatus, to: newStatus },
        error,
      });

      const status = error?.response?.status;
      if (status === 403) {
        toast.error('No autorizado para actualizar la tarea. Verifica permisos del grupo o sesión.');
      } else if (status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        toast.error(error.response?.data?.message || 'Error al actualizar la tarea');
      }
    }
  };

  const handleChangePage = (status: TaskStatus, page: number) => {
    setPageByStatus((prev) => ({ ...prev, [status]: page }));
  };

  const handleDeleteTask = async (task: TaskResponse) => {
    const confirmed = window.confirm(`¿Eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    // Snapshot para revertir en caso de error
    const prevSnapshot: Record<TaskStatus, TaskResponse[]> = {
      TODO: [...tasks.TODO],
      DOING: [...tasks.DOING],
      DONE: [...tasks.DONE],
    };

    try {
      // Optimista: elimina localmente
      setTasks((prev) => ({
        ...prev,
        [task.status]: prev[task.status].filter((t) => t.id !== task.id),
      }));

      const res = await tasksApi.deleteTask(task.id);
      apiLogger.tasks({ endpoint: 'deleteTask', success: res?.success ?? true, params: { id: task.id }, error: res?.success ? null : res });
      toast.success('Tarea eliminada');
    } catch (error: any) {
      // Revertir
      setTasks(prevSnapshot);
      apiLogger.tasks({ endpoint: 'deleteTask', success: false, params: { id: task.id }, error });
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('No autorizado para eliminar la tarea. Verifica permisos.');
      } else if (status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        toast.error(error?.response?.data?.message || 'Error al eliminar la tarea');
      }
    }
  };

  const handleCreateBugTask = async () => {
    try {
      const request = {
        title: 'No funciona el boton para dividir igualmente',
        description: `El botón "Dividir Igualmente" en el formulario de creación de tareas no está funcionando correctamente.

Problema:
- Al hacer clic en el botón "Dividir Igualmente", no se están creando las participaciones iguales para todos los miembros del grupo
- El botón parece estar deshabilitado o no responde al hacer clic

Pasos para reproducir:
1. Ir a crear una nueva tarea
2. Seleccionar modo de gasto futuro (crear o almacenar)
3. Ingresar un monto
4. Hacer clic en "Dividir Igualmente"
5. Las participaciones no se crean automáticamente

Ubicación:
- Componente: CreateTaskDialog.tsx
- Función: calculateEqualShares()
- Línea aproximada: 126-139`,
        groupId,
        priority: 'HIGH' as const,
      };

      const response = await tasksApi.createTask(request);
      if (response.success) {
        toast.success('Tarea de bug creada exitosamente');
        loadTasks(); // Recargar las tareas para mostrar la nueva
      } else {
        toast.error('Error al crear la tarea de bug');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la tarea de bug');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Fallback defensivo en caso de que alguna columna no sea un array por datos inesperados
  const allTasks = [
    ...(Array.isArray(tasks.TODO) ? tasks.TODO : []),
    ...(Array.isArray(tasks.DOING) ? tasks.DOING : []),
    ...(Array.isArray(tasks.DONE) ? tasks.DONE : []),
  ];
  const activeTask = allTasks.find((t) => t.id === activeId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kanban</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
          <Button onClick={handleCreateBugTask} variant="outline" title="Crear tarea de bug: No funciona el botón para dividir igualmente">
            🐛 Bug: Dividir Igualmente
          </Button>
          {onCreateTask && (
            <Button onClick={onCreateTask} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea (Externa)
            </Button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            status="TODO"
            tasks={tasks.TODO}
            page={pageByStatus.TODO}
            pageSize={pageSize}
            onChangePage={handleChangePage}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            status="DOING"
            tasks={tasks.DOING}
            page={pageByStatus.DOING}
            pageSize={pageSize}
            onChangePage={handleChangePage}
            onDeleteTask={handleDeleteTask}
          />
          <KanbanColumn
            status="DONE"
            tasks={tasks.DONE}
            page={pageByStatus.DONE}
            pageSize={pageSize}
            onChangePage={handleChangePage}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        groupId={groupId}
        onSuccess={(created) => {
          if (created) {
            setTasks((prev) => {
              const status = created.status as TaskStatus;
              const exists = prev[status].some((t) => t.id === created.id);
              const nextCol = exists ? prev[status] : [...prev[status], created];
              return { ...prev, [status]: nextCol } as Record<TaskStatus, TaskResponse[]>;
            });
          } else {
            // Fallback si no recibimos la tarea creada
            loadTasks();
          }
        }}
      />
    </div>
  );
}

