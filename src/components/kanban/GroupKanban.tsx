'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tasksApi } from '@/lib/api/tasks';
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
}

function TaskCard({ task }: TaskCardProps) {
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
      className="cursor-grab active:cursor-grabbing mb-2"
    >
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2">{task.title}</h4>
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
  onTaskClick?: (task: TaskResponse) => void;
}

function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const sortableTasks = tasks.map((task) => task.id);

  return (
    <div ref={setNodeRef} className={`flex-1 min-w-[300px] ${isOver ? 'bg-muted/50 rounded-lg p-2' : ''}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg capitalize">{status}</h3>
          <Badge className={statusColors[status]}>{tasks.length}</Badge>
        </div>
      </div>
      <SortableContext items={sortableTasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px]">
          {tasks.map((task) => (
            <div key={task.id} onClick={() => onTaskClick?.(task)}>
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      </SortableContext>
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
  const sensors = useSensors(
    useSensor(PointerSensor),
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

      setTasks({
        TODO: todoRes.success ? todoRes.data.content : [],
        DOING: doingRes.success ? doingRes.data.content : [],
        DONE: doneRes.success ? doneRes.data.content : [],
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar las tareas');
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
    const newStatus = over.id as TaskStatus;

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

    try {
      // Optimistic update
      const newTasks = { ...tasks };
      newTasks[oldStatus] = newTasks[oldStatus].filter((t) => t.id !== taskId);
      newTasks[newStatus] = [...newTasks[newStatus], { ...task, status: newStatus }];
      setTasks(newTasks);

      // Update in backend
      await tasksApi.updateTask(taskId, { status: newStatus });
      
      // Show message if task was moved to DONE and has future expense
      if (newStatus === 'DONE' && (task.futureExpenseAmount || task.expenseId)) {
        toast.success('Tarea completada. El gasto futuro se ha convertido en gasto real.');
      } else {
        toast.success('Tarea actualizada');
      }
    } catch (error: any) {
      // Revert on error
      loadTasks();
      toast.error(error.response?.data?.message || 'Error al actualizar la tarea');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const allTasks = [...tasks.TODO, ...tasks.DOING, ...tasks.DONE];
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
          <KanbanColumn status="TODO" tasks={tasks.TODO} />
          <KanbanColumn status="DOING" tasks={tasks.DOING} />
          <KanbanColumn status="DONE" tasks={tasks.DONE} />
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        groupId={groupId}
        onSuccess={loadTasks}
      />
    </div>
  );
}

