'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { tasksApi } from '@/lib/api/tasks';
import { expensesApi } from '@/lib/api/expenses';
import { groupsApi } from '@/lib/api/groups';
import { UpdateTaskRequest, TaskPriority, ExpenseResponse, ExpenseShareRequest, UserResponse, TaskResponse } from '@/types';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { DollarSign, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { IconSelector } from '@/components/common/IconSelector';

const updateTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
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

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskResponse | null;
  groupId: string;
  onSuccess?: (task?: TaskResponse) => void;
}

export function EditTaskDialog({ open, onOpenChange, task, groupId, onSuccess }: EditTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [groupMembers, setGroupMembers] = useState<UserResponse[]>([]);
  const [isExpenseSectionOpen, setIsExpenseSectionOpen] = useState(false);
  const [taskIcon, setTaskIcon] = useState<string | undefined>();

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

  const { fields: shareFields, append: appendShare, remove: removeShare, replace: replaceShares } = useFieldArray({
    control,
    name: 'futureExpenseShares',
  });

  const expenseMode = watch('expenseMode');
  const futureExpenseAmount = watch('futureExpenseAmount');

  useEffect(() => {
    if (open && groupId) {
      loadGroupData();
    }
  }, [open, groupId]);

  useEffect(() => {
    if (task && open) {
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
        expenseMode: expenseModeValue,
        expenseId: task.expenseId,
        createFutureExpense: false,
        futureExpenseAmount: task.futureExpenseAmount,
        futureExpenseCurrency: task.futureExpenseCurrency || 'USD',
        futureExpensePaidById: task.futureExpensePaidById,
        futureExpenseShares: task.futureExpenseShares || [],
      });
      setIsExpenseSectionOpen(expenseModeValue !== 'none');
      setTaskIcon(undefined); // Reset icon when editing (can be set if backend supports it)
    }
  }, [task, open, reset]);

  const loadGroupData = async () => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        groupsApi.getById(groupId),
        expensesApi.getAll({ groupId, page: 0, size: 100 }),
      ]);

      if (groupRes.success) {
        const members = groupRes.data.members.map(m => m.user);
        setGroupMembers(members);
      }

      if (expensesRes.success) {
        setExpenses(expensesRes.data.content);
      }
    } catch (error) {
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
    
    replaceShares(shares);
  };

  const onSubmit = async (data: UpdateTaskFormData) => {
    if (!task) return;
    
    setIsLoading(true);
    try {
      const request: UpdateTaskRequest = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority as TaskPriority | undefined,
        assignedToId: data.assignedToId,
        startDate: data.startDate,
        dueDate: data.dueDate,
      };

      if (data.expenseMode === 'reference' && data.expenseId) {
        request.expenseId = data.expenseId;
      } else if (data.expenseMode === 'create' || data.expenseMode === 'store') {
        request.createFutureExpense = data.expenseMode === 'create';
        request.futureExpenseAmount = data.futureExpenseAmount;
        request.futureExpenseCurrency = data.futureExpenseCurrency || 'USD';
        request.futureExpensePaidById = data.futureExpensePaidById;
        request.futureExpenseShares = data.futureExpenseShares;
      }

      const response = await tasksApi.updateTask(task.id, request);
      if (response.success) {
        toast.success('Tarea actualizada exitosamente');
        reset();
        onOpenChange(false);
        onSuccess?.(response.data);
      }
    } catch (error: unknown) {
      const message = (error && typeof error === 'object' && 'response' in error)
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || 'Error al actualizar la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <div className="flex items-center gap-2">
              <IconSelector
                value={taskIcon}
                onSelect={(value) => {
                  setTaskIcon(typeof value === 'string' ? value : undefined);
                }}
                type="both"
              />
              <Input id="edit-title" placeholder="Título de la tarea" className="flex-1" {...register('title')} />
            </div>
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción (opcional)</Label>
            <Input id="edit-description" placeholder="Descripción de la tarea" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <select
                id="edit-status"
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="TODO">TODO</option>
                <option value="DOING">DOING</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Prioridad</Label>
              <select
                id="edit-priority"
                {...register('priority')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar prioridad</option>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-assignedToId">Asignado a (opcional)</Label>
              <select
                id="edit-assignedToId"
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
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Fecha de Inicio (opcional)</Label>
              <Input id="edit-startDate" type="date" {...register('startDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Fecha de Vencimiento (opcional)</Label>
              <Input id="edit-dueDate" type="date" {...register('dueDate')} />
            </div>
          </div>

          <Collapsible open={isExpenseSectionOpen} onOpenChange={setIsExpenseSectionOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Gasto Futuro (opcional)
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
                    <RadioGroupItem value="none" id="edit-mode-none" />
                    <Label htmlFor="edit-mode-none" className="cursor-pointer">Sin gasto futuro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reference" id="edit-mode-reference" />
                    <Label htmlFor="edit-mode-reference" className="cursor-pointer">Referenciar Expense existente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="create" id="edit-mode-create" />
                    <Label htmlFor="edit-mode-create" className="cursor-pointer">Crear Expense automáticamente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="store" id="edit-mode-store" />
                    <Label htmlFor="edit-mode-store" className="cursor-pointer">Almacenar información (crear al completar)</Label>
                  </div>
                </RadioGroup>
              </div>

              {expenseMode === 'reference' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-expenseId">Seleccionar Expense *</Label>
                  <select
                    id="edit-expenseId"
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
                      <Label htmlFor="edit-futureExpenseAmount">Monto *</Label>
                      <Input
                        id="edit-futureExpenseAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('futureExpenseAmount', { valueAsNumber: true })}
                      />
                      {errors.futureExpenseAmount && <p className="text-sm text-destructive">{errors.futureExpenseAmount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-futureExpenseCurrency">Moneda</Label>
                      <Input
                        id="edit-futureExpenseCurrency"
                        placeholder="USD"
                        {...register('futureExpenseCurrency')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-futureExpensePaidById">Pagado por *</Label>
                    <select
                      id="edit-futureExpensePaidById"
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
                    {errors.futureExpenseShares && (
                      <p className="text-sm text-destructive">{errors.futureExpenseShares.message}</p>
                    )}
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

