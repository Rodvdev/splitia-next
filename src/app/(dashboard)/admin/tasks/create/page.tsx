'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, X, DollarSign } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { expensesApi } from '@/lib/api/expenses';
import { groupsApi } from '@/lib/api/groups';
import { CreateTaskRequest, GroupResponse, UserResponse, TaskPriority, ExpenseResponse, ExpenseShareRequest } from '@/types';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  groupId: z.string().min(1, 'El grupo es requerido'),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
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

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export default function CreateTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [groupMembers, setGroupMembers] = useState<UserResponse[]>([]);
  const [isExpenseSectionOpen, setIsExpenseSectionOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
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
  const selectedGroupIdForm = watch('groupId');
  const futureExpenseAmount = watch('futureExpenseAmount');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedGroupIdForm && selectedGroupIdForm !== selectedGroupId) {
      setSelectedGroupId(selectedGroupIdForm);
      loadGroupData(selectedGroupIdForm);
    }
  }, [selectedGroupIdForm]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const groupsRes = await adminApi.getAllGroups({ page: 0, size: 100 });
      apiLogger.groups({
        endpoint: 'getAllGroups (for create task)',
        success: groupsRes.success,
        params: { page: 0, size: 100 },
        data: groupsRes.data,
        error: groupsRes.success ? null : groupsRes,
      });
      if (groupsRes.success) {
        setGroups(extractDataFromResponse(groupsRes));
      }
    } catch (error) {
      apiLogger.groups({
        endpoint: 'getAllGroups (for create task)',
        success: false,
        params: { page: 0, size: 100 },
        error: error,
      });
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadGroupData = async (groupId: string) => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        groupsApi.getById(groupId),
        expensesApi.getAll({ groupId, page: 0, size: 100 }),
      ]);

      apiLogger.groups({
        endpoint: 'getById (for create task)',
        success: groupRes.success,
        params: { id: groupId },
        data: groupRes.data,
        error: groupRes.success ? null : groupRes,
      });
      apiLogger.expenses({
        endpoint: 'getAll (for create task)',
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
        endpoint: 'loadGroupData (for create task)',
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

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsLoading(true);
    const request: CreateTaskRequest = {
      title: data.title,
      description: data.description,
      groupId: data.groupId,
      assignedToId: data.assignedToId,
      priority: data.priority as TaskPriority | undefined,
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

    try {
      const response = await adminApi.createTask(request);
      apiLogger.tasks({
        endpoint: 'createTask',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Tarea creada exitosamente');
        router.push('/admin/tasks');
      }
    } catch (error: any) {
      apiLogger.tasks({
        endpoint: 'createTask',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Tarea</h1>
          <p className="text-muted-foreground">Crea una nueva tarea en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Tarea</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" placeholder="Título de la tarea" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" placeholder="Descripción de la tarea" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupId">Grupo *</Label>
                <select
                  id="groupId"
                  {...register('groupId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.groupId && <p className="text-sm text-destructive">{errors.groupId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToId">Asignado a (opcional)</Label>
                <select
                  id="assignedToId"
                  {...register('assignedToId')}
                  disabled={!selectedGroupId}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sin asignar</option>
                  {groupMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.lastName} ({member.email})
                    </option>
                  ))}
                </select>
                {!selectedGroupId && (
                  <p className="text-xs text-muted-foreground">Selecciona un grupo primero</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad (opcional)</Label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="startDate">Fecha de Inicio (opcional)</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento (opcional)</Label>
                <Input id="dueDate" type="date" {...register('dueDate')} />
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
                    {expenses.length === 0 && selectedGroupId && (
                      <p className="text-sm text-muted-foreground">No hay expenses disponibles en este grupo</p>
                    )}
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
                      {shareFields.length === 0 && (
                        <p className="text-sm text-muted-foreground">Agrega al menos una participación</p>
                      )}
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

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Tarea'}
              </Button>
              <Link href="/admin/tasks">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}