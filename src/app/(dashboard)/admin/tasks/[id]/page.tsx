'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { adminApi } from '@/lib/api/admin';
import { expensesApi } from '@/lib/api/expenses';
import { groupsApi } from '@/lib/api/groups';
import { TaskResponse, UpdateTaskRequest, TaskStatus, TaskPriority, GroupResponse, UserResponse, ExpenseResponse, ExpenseShareRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Edit, Save, X, CheckSquare, Calendar, User, Tag, DollarSign, Link as LinkIcon, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

const updateTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  position: z.number().optional(),
  expenseMode: z.enum(['none', 'reference', 'create', 'store']).optional(),
  expenseId: z.string().optional(),
  createFutureExpense: z.boolean().optional(),
  futureExpenseAmount: z.number().min(0.01).optional(),
  futureExpenseCurrency: z.string().optional(),
  futureExpensePaidById: z.string().optional(),
  futureExpenseShares: z.array(z.object({
    userId: z.string().min(1, 'Usuario requerido'),
    amount: z.number().min(0.01, 'Monto debe ser mayor a 0'),
    type: z.enum(['EQUAL', 'PERCENTAGE', 'FIXED']),
  })).optional(),
}).refine((data) => {
  if (data.expenseMode === 'reference') {
    return !!data.expenseId;
  }
  if (data.expenseMode === 'create' || data.expenseMode === 'store') {
    return !!data.futureExpenseAmount && !!data.futureExpensePaidById && 
           data.futureExpenseShares && data.futureExpenseShares.length > 0;
  }
  return true;
}, {
  message: 'Completa todos los campos requeridos para el gasto futuro',
  path: ['expenseMode'],
});

type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

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

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [groupMembers, setGroupMembers] = useState<UserResponse[]>([]);
  const [isExpenseSectionOpen, setIsExpenseSectionOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      expenseMode: 'none',
      createFutureExpense: false,
      futureExpenseCurrency: 'USD',
      futureExpenseShares: [],
    },
  });

  const { fields: shareFields, append: appendShare, remove: removeShare } = useFieldArray({
    control,
    name: 'futureExpenseShares',
  });

  const expenseMode = watch('expenseMode');
  const futureExpenseAmount = watch('futureExpenseAmount');

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  useEffect(() => {
    if (task) {
      if (task.group?.id) {
        loadGroupData(task.group.id);
      }
      if (isEditing) {
        const expenseModeValue = task.expenseId ? 'reference' : 
                                 (task.futureExpenseAmount ? 'store' : 'none');
        reset({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedToId: task.assignedTo?.id,
          startDate: task.startDate ? task.startDate.split('T')[0] : undefined,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
          position: task.position,
          expenseMode: expenseModeValue,
          expenseId: task.expenseId,
          createFutureExpense: false,
          futureExpenseAmount: task.futureExpenseAmount,
          futureExpenseCurrency: task.futureExpenseCurrency || 'USD',
          futureExpensePaidById: task.futureExpensePaidById,
          futureExpenseShares: task.futureExpenseShares || [],
        });
      }
    }
  }, [task, isEditing, reset]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getTaskById(taskId);
      apiLogger.tasks({
        endpoint: 'getTaskById',
        success: response.success,
        params: { id: taskId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setTask(response.data);
      }
    } catch (err: any) {
      apiLogger.tasks({
        endpoint: 'getTaskById',
        success: false,
        params: { id: taskId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  };


  const loadGroupData = async (groupId: string) => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        groupsApi.getById(groupId),
        expensesApi.getAll({ groupId, page: 0, size: 100 }),
      ]);

      apiLogger.groups({
        endpoint: 'getById (for task)',
        success: groupRes.success,
        params: { id: groupId },
        data: groupRes.data,
        error: groupRes.success ? null : groupRes,
      });
      apiLogger.expenses({
        endpoint: 'getAll (for task)',
        success: expensesRes.success,
        params: { groupId, page: 0, size: 100 },
        data: expensesRes.data,
        error: expensesRes.success ? null : expensesRes,
      });

      if (groupRes.success) {
        const members = groupRes.data.members.map(m => m.user);
        setGroupMembers(members);
      }

      if (expensesRes.success) {
        setExpenses(extractDataFromResponse(expensesRes));
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'loadGroupData',
        success: false,
        params: { groupId },
        error: error,
      });
      console.error('Error loading group data:', error);
    }
  };

  const calculateEqualShares = () => {
    if (!futureExpenseAmount || !groupMembers.length) return;
    
    const amountPerPerson = futureExpenseAmount / groupMembers.length;
    const shares: ExpenseShareRequest[] = groupMembers.map(member => ({
      userId: member.id,
      amount: amountPerPerson,
      type: 'EQUAL' as const,
    }));
    
    setValue('futureExpenseShares', shares);
    shareFields.forEach((_, index) => removeShare(index));
    shares.forEach(share => appendShare(share));
  };

  const onSubmit = async (data: UpdateTaskFormData) => {
    setIsSaving(true);
    const request: UpdateTaskRequest = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedToId: data.assignedToId,
      startDate: data.startDate,
      dueDate: data.dueDate,
      position: data.position,
    };

    if (data.expenseMode === 'reference' && data.expenseId) {
      request.expenseId = data.expenseId;
    } else if (data.expenseMode === 'create' || data.expenseMode === 'store') {
      request.createFutureExpense = data.expenseMode === 'create';
      request.futureExpenseAmount = data.futureExpenseAmount;
      request.futureExpenseCurrency = data.futureExpenseCurrency || 'USD';
      request.futureExpensePaidById = data.futureExpensePaidById;
      request.futureExpenseShares = data.futureExpenseShares;
    } else if (data.expenseMode === 'none') {
      request.expenseId = undefined;
      request.futureExpenseAmount = undefined;
      request.futureExpenseCurrency = undefined;
      request.futureExpensePaidById = undefined;
      request.futureExpenseShares = undefined;
    }

    try {
      const response = await adminApi.updateTask(taskId, request);
      apiLogger.tasks({
        endpoint: 'updateTask',
        success: response.success,
        params: { id: taskId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        const wasDone = task?.status === 'DONE';
        const isNowDone = data.status === 'DONE';
        if (wasDone !== isNowDone && isNowDone && task?.futureExpenseAmount) {
          toast.success('Tarea completada. El gasto futuro se ha convertido en gasto real.');
        } else {
          toast.success('Tarea actualizada exitosamente');
        }
        setTask(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.tasks({
        endpoint: 'updateTask',
        success: false,
        params: { id: taskId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la tarea');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteTask(taskId);
      apiLogger.tasks({
        endpoint: 'deleteTask',
        success: response.success,
        params: { id: taskId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Tarea eliminada correctamente');
        router.push('/admin/tasks');
      }
    } catch (err: any) {
      apiLogger.tasks({
        endpoint: 'deleteTask',
        success: false,
        params: { id: taskId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar la tarea');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!task) {
    return <ErrorMessage message="Tarea no encontrada" />;
  }

  const hasFutureExpense = !!(task.expenseId || task.futureExpenseAmount);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <h1 className="text-3xl font-bold">Editar Tarea</h1>
          ) : (
            <h1 className="text-3xl font-bold">{task.title}</h1>
          )}
          <p className="text-muted-foreground">Detalles de la tarea</p>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
              <X className="h-4 w-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" {...register('description')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      {...register('status')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="TODO">TODO</option>
                      <option value="DOING">DOING</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <select
                      id="priority"
                      {...register('priority')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedToId">Asignado a</Label>
                  <select
                    id="assignedToId"
                    {...register('assignedToId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sin asignar</option>
                    {groupMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.lastName} ({member.email})
                      </option>
                    ))}
                  </select>
                  {groupMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground">Cargando miembros del grupo...</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input id="startDate" type="date" {...register('startDate')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                    <Input id="dueDate" type="date" {...register('dueDate')} />
                  </div>
                </div>

                <Collapsible open={isExpenseSectionOpen} onOpenChange={setIsExpenseSectionOpen}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Gasto Futuro
                      </span>
                      {isExpenseSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Modo de Gasto Futuro</Label>
                      <RadioGroup
                        value={expenseMode || 'none'}
                        onValueChange={(value) => {
                          setValue('expenseMode', value as 'none' | 'reference' | 'create' | 'store');
                          if (value === 'none') {
                            setValue('expenseId', undefined);
                            setValue('createFutureExpense', false);
                            setValue('futureExpenseAmount', undefined);
                            setValue('futureExpensePaidById', undefined);
                            setValue('futureExpenseShares', []);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="mode-none" />
                          <Label htmlFor="mode-none" className="cursor-pointer">Sin gasto futuro</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reference" id="mode-reference" />
                          <Label htmlFor="mode-reference" className="cursor-pointer">Referenciar Expense existente</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="create" id="mode-create" />
                          <Label htmlFor="mode-create" className="cursor-pointer">Crear Expense automáticamente</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="store" id="mode-store" />
                          <Label htmlFor="mode-store" className="cursor-pointer">Almacenar información (crear al completar)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {expenseMode === 'reference' && (
                      <div className="space-y-2">
                        <Label htmlFor="expenseId">Seleccionar Expense *</Label>
                        <select
                          id="expenseId"
                          {...register('expenseId')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar expense</option>
                          {expenses.map((expense) => (
                            <option key={expense.id} value={expense.id}>
                              {expense.description} - {formatCurrency(expense.amount, expense.currency)} ({formatDate(expense.date, 'PP', 'es')})
                            </option>
                          ))}
                        </select>
                        {errors.expenseId && <p className="text-sm text-destructive">{errors.expenseId.message}</p>}
                      </div>
                    )}

                    {(expenseMode === 'create' || expenseMode === 'store') && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="futureExpenseAmount">Monto *</Label>
                            <Input
                              id="futureExpenseAmount"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...register('futureExpenseAmount', { valueAsNumber: true })}
                            />
                            {errors.futureExpenseAmount && <p className="text-sm text-destructive">{errors.futureExpenseAmount.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="futureExpenseCurrency">Moneda</Label>
                            <Input
                              id="futureExpenseCurrency"
                              placeholder="USD"
                              {...register('futureExpenseCurrency')}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="futureExpensePaidById">Pagado por *</Label>
                          <select
                            id="futureExpensePaidById"
                            {...register('futureExpensePaidById')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar usuario</option>
                            {groupMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name} {member.lastName} ({member.email})
                              </option>
                            ))}
                          </select>
                          {errors.futureExpensePaidById && <p className="text-sm text-destructive">{errors.futureExpensePaidById.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Participaciones *</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={calculateEqualShares}
                                disabled={!futureExpenseAmount || groupMembers.length === 0}
                              >
                                Dividir Igualmente
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendShare({ userId: '', amount: 0, type: 'FIXED' })}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                          {shareFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-end">
                              <div className="flex-1 space-y-2">
                                <Label>Usuario</Label>
                                <select
                                  {...register(`futureExpenseShares.${index}.userId`)}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  <option value="">Seleccionar</option>
                                  {groupMembers.map((member) => (
                                    <option key={member.id} value={member.id}>
                                      {member.name} {member.lastName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label>Monto</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...register(`futureExpenseShares.${index}.amount`, { valueAsNumber: true })}
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label>Tipo</Label>
                                <select
                                  {...register(`futureExpenseShares.${index}.type`)}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  <option value="FIXED">Fijo</option>
                                  <option value="EQUAL">Igual</option>
                                  <option value="PERCENTAGE">Porcentaje</option>
                                </select>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeShare(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Título</p>
                  <p className="text-lg font-semibold">{task.title}</p>
                </div>
                {task.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-sm">{task.description}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prioridad</p>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grupo</p>
                  <p className="text-sm font-medium">{task.group.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asignado a</p>
                  <p className="text-sm">
                    {task.assignedTo ? `${task.assignedTo.name} ${task.assignedTo.lastName}` : 'Sin asignar'}
                  </p>
                </div>
                {task.startDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                    <p className="text-sm">{formatDate(task.startDate, 'PP', 'es')}</p>
                  </div>
                )}
                {task.dueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="text-sm">{formatDate(task.dueDate, 'PP', 'es')}</p>
                  </div>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Etiquetas</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Creado por</p>
                <p className="text-sm font-medium">
                  {task.createdBy.name} {task.createdBy.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                <p className="text-sm">{formatDate(task.createdAt, 'PP', 'es')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Actualización</p>
                <p className="text-sm">{formatDate(task.updatedAt, 'PP', 'es')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posición</p>
                <p className="text-sm">{task.position}</p>
              </div>
            </CardContent>
          </Card>

          {hasFutureExpense && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gasto Futuro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.expenseId ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Expense Asociado</p>
                      <Link href={`/admin/expenses/${task.expenseId}`}>
                        <Button variant="link" className="p-0 h-auto">
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Ver Expense
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {task.futureExpenseAmount && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Monto</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(task.futureExpenseAmount, task.futureExpenseCurrency || 'USD')}
                          </p>
                        </div>
                        {task.futureExpensePaidByName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Pagado por</p>
                            <p className="text-sm font-medium">{task.futureExpensePaidByName}</p>
                          </div>
                        )}
                        {task.futureExpenseShares && task.futureExpenseShares.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Participaciones</p>
                            <div className="space-y-1">
                              {task.futureExpenseShares.map((share, index) => {
                                const user = groupMembers.find(m => m.id === share.userId);
                                return (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{user ? `${user.name} ${user.lastName}` : share.userId}</span>
                                    <span className="font-medium">
                                      {formatCurrency(share.amount, task.futureExpenseCurrency || 'USD')}
                                      {share.type === 'PERCENTAGE' && ' (%)'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {task.status === 'DONE' && (
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              ✓ Esta tarea está completada. El gasto futuro se ha convertido en gasto real automáticamente.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}