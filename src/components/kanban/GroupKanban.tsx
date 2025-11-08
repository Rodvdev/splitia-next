'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tasksApi } from '@/lib/api/tasks';
import { groupsApi } from '@/lib/api/groups';
import { apiLogger } from '@/lib/utils/api-logger';
import { TaskResponse, TaskStatus, TaskPriority, UserResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Plus, Calendar, User, Tag as TagIcon, DollarSign, Edit, Trash2, MoreVertical, Check, X } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
  status: TaskStatus;
  groupId: string;
  groupMembers: UserResponse[];
  onDelete?: (task: TaskResponse) => void;
  onClick?: (task: TaskResponse) => void;
  onUpdate?: (task: TaskResponse) => void;
}

function TaskCard({ task, status, groupId, groupMembers, onDelete, onClick, onUpdate }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingAssigned, setIsEditingAssigned] = useState(false);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  
  const [titleValue, setTitleValue] = useState(task.title);
  const [descriptionValue, setDescriptionValue] = useState(task.description || '');
  const [priorityValue, setPriorityValue] = useState(task.priority);
  const [assignedValue, setAssignedValue] = useState(task.assignedTo?.id || '');
  const [startDateValue, setStartDateValue] = useState(task.startDate ? new Date(task.startDate) : undefined);
  const [dueDateValue, setDueDateValue] = useState(task.dueDate ? new Date(task.dueDate) : undefined);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasFutureExpense = !!(task.expenseId || task.futureExpenseAmount);
  
  // Mapear colores de estado a clases de hover
  const getStatusHoverClass = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'hover:bg-gray-500/20';
      case 'DOING':
        return 'hover:bg-blue-500/20';
      case 'DONE':
        return 'hover:bg-green-500/20';
      default:
        return 'hover:bg-muted/20';
    }
  };

  // Sincronizar valores cuando cambia la tarea
  useEffect(() => {
    setTitleValue(task.title);
    setDescriptionValue(task.description || '');
    setPriorityValue(task.priority);
    setAssignedValue(task.assignedTo?.id || '');
    setStartDateValue(task.startDate ? new Date(task.startDate) : undefined);
    setDueDateValue(task.dueDate ? new Date(task.dueDate) : undefined);
  }, [task]);

  // Auto-focus en inputs cuando se activa la edición
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const saveField = async (field: string, value: any) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const updateData: any = { [field]: value };
      const response = await tasksApi.updateTask(task.id, updateData);
      
      if (response.success && response.data) {
        onUpdate?.(response.data);
        // No mostrar toast para guardados automáticos, solo para errores
      } else {
        toast.error('Error al guardar cambios');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleBlur = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      saveField('title', titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionBlur = () => {
    if (descriptionValue !== (task.description || '')) {
      saveField('description', descriptionValue.trim() || undefined);
    }
    setIsEditingDescription(false);
  };

  const handlePriorityChange = (value: string) => {
    setPriorityValue(value as TaskPriority);
    setIsEditingPriority(false);
    if (value !== task.priority) {
      saveField('priority', value);
    }
  };

  const handleAssignedChange = (value: string) => {
    setAssignedValue(value);
    setIsEditingAssigned(false);
    if (value !== (task.assignedTo?.id || '')) {
      saveField('assignedToId', value || undefined);
    }
  };

  const handleDateSelect = (date: Date | undefined, field: 'startDate' | 'dueDate') => {
    if (field === 'startDate') {
      setStartDateValue(date);
      setIsEditingStartDate(false);
      const dateStr = date ? date.toISOString().split('T')[0] : undefined;
      if (dateStr !== (task.startDate?.split('T')[0] || undefined)) {
        saveField('startDate', dateStr);
      }
    } else {
      setDueDateValue(date);
      setIsEditingDueDate(false);
      const dateStr = date ? date.toISOString().split('T')[0] : undefined;
      if (dateStr !== (task.dueDate?.split('T')[0] || undefined)) {
        saveField('dueDate', dateStr);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, onBlur: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onBlur();
    } else if (e.key === 'Escape') {
      // Revertir cambios
      setTitleValue(task.title);
      setDescriptionValue(task.description || '');
      setIsEditingTitle(false);
      setIsEditingDescription(false);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group cursor-grab active:cursor-grabbing mb-2 w-full relative"
    >
      <CardContent className="p-4">
        {/* Icono de menú visible on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.(task);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Título editable */}
        <div className="flex items-start gap-2 mb-2 pr-8">
          {isEditingTitle ? (
            <Input
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => handleKeyDown(e, handleTitleBlur)}
              className="font-semibold text-base h-auto py-1 px-2"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 
              className="font-semibold flex-1 cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
            >
              {task.title}
            </h4>
          )}
        </div>

        {/* Descripción editable */}
        <div className="mb-2">
          {isEditingDescription ? (
            <Textarea
              ref={descriptionInputRef}
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={(e) => handleKeyDown(e, handleDescriptionBlur)}
              className="text-sm min-h-[60px] resize-none"
              onClick={(e) => e.stopPropagation()}
              placeholder="Agregar descripción..."
            />
          ) : (
            <p 
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors min-h-[20px]"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDescription(true);
              }}
            >
              {task.description || <span className="text-muted-foreground/50 italic">Click para agregar descripción...</span>}
            </p>
          )}
        </div>

        {/* Badges y tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Prioridad editable */}
          {isEditingPriority ? (
            <Select value={priorityValue} onValueChange={handlePriorityChange}>
              <SelectTrigger 
                size="sm" 
                className="h-6 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge 
              className={`${priorityColors[task.priority]} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingPriority(true);
              }}
            >
              {task.priority}
            </Badge>
          )}
          
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

        {/* Información inferior editable */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {/* Asignado editable */}
          {isEditingAssigned ? (
            <Select value={assignedValue} onValueChange={handleAssignedChange}>
              <SelectTrigger 
                size="sm" 
                className="h-6 text-xs w-[120px]"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {groupMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} {member.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            task.assignedTo ? (
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingAssigned(true);
                }}
              >
                <User className="h-3 w-3" />
                <span>{task.assignedTo.name}</span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingAssigned(true);
                }}
              >
                <User className="h-3 w-3" />
                <span>Asignar</span>
              </div>
            )
          )}

          {/* Fecha de inicio editable */}
          {isEditingStartDate ? (
            <Popover open={isEditingStartDate} onOpenChange={setIsEditingStartDate}>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <Calendar className="h-3 w-3" />
                  <span>{startDateValue ? formatDate(startDateValue.toISOString(), 'PP', 'es') : 'Seleccionar fecha'}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                <CalendarComponent
                  mode="single"
                  selected={startDateValue}
                  onSelect={(date) => handleDateSelect(date, 'startDate')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            task.startDate && (
              <div 
                className={`flex items-center gap-1 cursor-pointer rounded px-1 transition-colors ${getStatusHoverClass(status)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingStartDate(true);
                }}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.startDate, 'PP', 'es')}</span>
              </div>
            )
          )}

          {/* Fecha de vencimiento editable */}
          {isEditingDueDate ? (
            <Popover open={isEditingDueDate} onOpenChange={setIsEditingDueDate}>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <Calendar className="h-3 w-3" />
                  <span>{dueDateValue ? formatDate(dueDateValue.toISOString(), 'PP', 'es') : 'Seleccionar fecha'}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                <CalendarComponent
                  mode="single"
                  selected={dueDateValue}
                  onSelect={(date) => handleDateSelect(date, 'dueDate')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            task.dueDate && (
              <div 
                className={`flex items-center gap-1 cursor-pointer rounded px-1 transition-colors ${getStatusHoverClass(status)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingDueDate(true);
                }}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate, 'PP', 'es')}</span>
              </div>
            )
          )}

          {/* Botón para agregar fecha de vencimiento si no existe */}
          {!task.dueDate && !isEditingDueDate && (
            <div 
              className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDueDate(true);
              }}
            >
              <Calendar className="h-3 w-3" />
              <span>Agregar fecha</span>
            </div>
          )}
        </div>

        {/* Botón eliminar */}
        {onDelete && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              title="Eliminar tarea"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(task);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskResponse[];
  page: number;
  pageSize: number;
  groupId: string;
  groupMembers: UserResponse[];
  onChangePage: (status: TaskStatus, page: number) => void;
  onTaskClick?: (task: TaskResponse) => void;
  onDeleteTask?: (task: TaskResponse) => void;
  onTaskUpdate?: (task: TaskResponse) => void;
}

function KanbanColumn({ status, tasks, page, pageSize, groupId, groupMembers, onChangePage, onTaskClick, onDeleteTask, onTaskUpdate }: KanbanColumnProps) {
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
            <TaskCard 
              key={task.id} 
              task={task}
              status={status}
              groupId={groupId}
              groupMembers={groupMembers}
              onDelete={onDeleteTask}
              onClick={onTaskClick}
              onUpdate={onTaskUpdate}
            />
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
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserResponse[]>([]);
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
    loadGroupMembers();
  }, [groupId]);

  const loadGroupMembers = async () => {
    try {
      const response = await groupsApi.getById(groupId);
      if (response.success) {
        const members = response.data.members.map(m => m.user);
        setGroupMembers(members);
      }
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  };

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

  const handleTaskClick = (task: TaskResponse) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask: TaskResponse) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      // Actualizar la tarea en su columna correspondiente
      Object.keys(newTasks).forEach((status) => {
        const statusKey = status as TaskStatus;
        const index = newTasks[statusKey].findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          // Si cambió de estado, moverla
          if (updatedTask.status !== statusKey) {
            newTasks[statusKey] = newTasks[statusKey].filter((t) => t.id !== updatedTask.id);
            newTasks[updatedTask.status] = [...newTasks[updatedTask.status], updatedTask];
          } else {
            // Actualizar en el mismo lugar
            newTasks[statusKey][index] = updatedTask;
          }
        }
      });
      return newTasks;
    });
    // Actualizar también selectedTask si está abierto
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleEditSuccess = (updatedTask?: TaskResponse) => {
    if (updatedTask) {
      setTasks((prev) => {
        const newTasks = { ...prev };
        // Actualizar la tarea en su columna correspondiente
        Object.keys(newTasks).forEach((status) => {
          const statusKey = status as TaskStatus;
          const index = newTasks[statusKey].findIndex((t) => t.id === updatedTask.id);
          if (index !== -1) {
            // Si cambió de estado, moverla
            if (updatedTask.status !== statusKey) {
              newTasks[statusKey] = newTasks[statusKey].filter((t) => t.id !== updatedTask.id);
              newTasks[updatedTask.status] = [...newTasks[updatedTask.status], updatedTask];
            } else {
              // Actualizar en el mismo lugar
              newTasks[statusKey][index] = updatedTask;
            }
          }
        });
        return newTasks;
      });
      setSelectedTask(updatedTask);
    } else {
      loadTasks();
    }
    setIsEditDialogOpen(false);
    setEditingTask(null);
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
            groupId={groupId}
            groupMembers={groupMembers}
            onChangePage={handleChangePage}
            onTaskClick={handleTaskClick}
            onDeleteTask={handleDeleteTask}
            onTaskUpdate={handleTaskUpdate}
          />
          <KanbanColumn
            status="DOING"
            tasks={tasks.DOING}
            page={pageByStatus.DOING}
            pageSize={pageSize}
            groupId={groupId}
            groupMembers={groupMembers}
            onChangePage={handleChangePage}
            onTaskClick={handleTaskClick}
            onDeleteTask={handleDeleteTask}
            onTaskUpdate={handleTaskUpdate}
          />
          <KanbanColumn
            status="DONE"
            tasks={tasks.DONE}
            page={pageByStatus.DONE}
            pageSize={pageSize}
            groupId={groupId}
            groupMembers={groupMembers}
            onChangePage={handleChangePage}
            onTaskClick={handleTaskClick}
            onDeleteTask={handleDeleteTask}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} status={activeTask.status} groupId={groupId} groupMembers={groupMembers} /> : null}
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

      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        groupId={groupId}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de detalles de la tarea */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Descripción</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTask.description || 'Sin descripción'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Estado</Label>
                  <Badge className={`mt-1 ${statusColors[selectedTask.status]}`}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Prioridad</Label>
                  <Badge className={`mt-1 ${priorityColors[selectedTask.priority]}`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
              </div>
              {selectedTask.assignedTo && (
                <div>
                  <Label className="text-sm font-semibold">Asignado a</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTask.assignedTo.name} {selectedTask.assignedTo.lastName}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedTask.startDate && (
                  <div>
                    <Label className="text-sm font-semibold">Fecha de Inicio</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(selectedTask.startDate, 'PP', 'es')}
                    </p>
                  </div>
                )}
                {selectedTask.dueDate && (
                  <div>
                    <Label className="text-sm font-semibold">Fecha de Vencimiento</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(selectedTask.dueDate, 'PP', 'es')}
                    </p>
                  </div>
                )}
              </div>
              {selectedTask.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Etiquetas</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTask.tags.map((tag) => (
                      <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-white">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(selectedTask.futureExpenseAmount || selectedTask.expenseId) && (
                <div>
                  <Label className="text-sm font-semibold">Gasto Futuro</Label>
                  <div className="mt-1 space-y-1">
                    {selectedTask.futureExpenseAmount && (
                      <p className="text-sm text-muted-foreground">
                        Monto: {formatCurrency(selectedTask.futureExpenseAmount, selectedTask.futureExpenseCurrency || 'USD')}
                      </p>
                    )}
                    {selectedTask.expenseId && (
                      <p className="text-sm text-muted-foreground">
                        Expense vinculado: {selectedTask.expenseId}
                      </p>
                    )}
                    {selectedTask.futureExpensePaidByName && (
                      <p className="text-sm text-muted-foreground">
                        Pagado por: {selectedTask.futureExpensePaidByName}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-semibold">Creado por</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTask.createdBy.name} {selectedTask.createdBy.lastName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Fecha de creación</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(selectedTask.createdAt, 'PPpp', 'es')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                if (selectedTask) {
                  setEditingTask(selectedTask);
                  setIsEditDialogOpen(true);
                  setSelectedTask(null);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedTask) {
                  handleDeleteTask(selectedTask);
                  setSelectedTask(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

