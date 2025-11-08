'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupsApi } from '@/lib/api/groups';
import { expensesApi } from '@/lib/api/expenses';
import { GroupResponse, ExpenseResponse, CreateExpenseRequest, UpdateExpenseRequest, ExpenseShareRequest, UpdateGroupRequest, UpdateGroupMemberRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Users, Receipt, CheckSquare, Info, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import Link from 'next/link';
import { GroupKanban } from '@/components/kanban/GroupKanban';
import { apiLogger } from '@/lib/utils/api-logger';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { groupInvitationsApi } from '@/lib/api/group-invitations';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const updateGroupSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
});

const createExpenseSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
  currency: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  paidById: z.string().min(1, 'El usuario que pagó es requerido'),
  shares: z.array(z.object({
    userId: z.string().min(1, 'Usuario requerido'),
    amount: z.number().min(0.01, 'Monto debe ser mayor a 0'),
    type: z.enum(['EQUAL', 'PERCENTAGE', 'FIXED']),
  })).min(1, 'Debe haber al menos una participación'),
});

const updateExpenseSchema = z.object({
  amount: z.number().min(0.01).optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
  currency: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;
type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [addUserId, setAddUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const { user } = useAuthStore();

  const {
    register: registerGroup,
    handleSubmit: handleSubmitGroup,
    reset: resetGroup,
    formState: { errors: errorsGroup },
  } = useForm<UpdateGroupFormData>({
    resolver: zodResolver(updateGroupSchema),
  });

  const {
    register: registerExpense,
    handleSubmit: handleSubmitExpense,
    reset: resetExpense,
    control: controlExpense,
    watch: watchExpense,
    setValue: setValueExpense,
    formState: { errors: errorsExpense },
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      currency: 'USD',
      shares: [],
    },
  });

  const {
    register: registerUpdateExpense,
    handleSubmit: handleSubmitUpdateExpense,
    reset: resetUpdateExpense,
    formState: { errors: errorsUpdateExpense },
  } = useForm<UpdateExpenseFormData>({
    resolver: zodResolver(updateExpenseSchema),
  });

  const { fields: shareFields, append: appendShare, remove: removeShare } = useFieldArray({
    control: controlExpense,
    name: 'shares',
  });

  const futureExpenseAmount = watchExpense('amount');
  const groupMembers = group?.members.map(m => m.user) || [];

  useEffect(() => {
    if (groupId) {
      loadGroup();
      loadExpenses();
    }
  }, [groupId]);

  useEffect(() => {
    if (group && isEditingGroup) {
      resetGroup({
        name: group.name,
        description: group.description || '',
      });
    }
  }, [group, isEditingGroup, resetGroup]);

  useEffect(() => {
    if (editingExpense) {
      resetUpdateExpense({
        amount: editingExpense.amount,
        description: editingExpense.description,
        date: editingExpense.date.split('T')[0],
        currency: editingExpense.currency,
        location: editingExpense.location,
        notes: editingExpense.notes,
      });
    }
  }, [editingExpense, resetUpdateExpense]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupsApi.getById(groupId);
      apiLogger.groups({
        endpoint: 'getById',
        success: response.success,
        params: { id: groupId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setGroup(response.data);
      }
    } catch (err: any) {
      apiLogger.groups({
        endpoint: 'getById',
        success: false,
        params: { id: groupId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await expensesApi.getAll({ groupId, page: 0, size: 100 });
      apiLogger.expenses({
        endpoint: 'getAll',
        success: response.success,
        params: { groupId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setExpenses(extractDataFromResponse(response));
      }
    } catch (error) {
      apiLogger.expenses({
        endpoint: 'getAll',
        success: false,
        params: { groupId },
        error,
      });
      console.error('Error loading expenses:', error);
    }
  };

  const canManageMembers = (() => {
    if (!group || !user) return false;
    return group.members.some((m) => m.user.id === user.id && m.role === 'ADMIN');
  })();

  const canEditGroup = (() => {
    if (!group || !user) return false;
    return group.members.some((m) => m.user.id === user.id && m.role === 'ADMIN');
  })();

  const handleUpdateGroup = async (data: UpdateGroupFormData) => {
    try {
      setIsSubmitting(true);
      const request: UpdateGroupRequest = {
        name: data.name,
        description: data.description || undefined,
      };
      const response = await groupsApi.update(groupId, request);
      apiLogger.groups({
        endpoint: 'update',
        success: response.success,
        params: { id: groupId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Grupo actualizado exitosamente');
        setIsEditingGroup(false);
        await loadGroup();
      } else {
        toast.error('Error al actualizar el grupo');
      }
    } catch (error: any) {
      apiLogger.groups({
        endpoint: 'update',
        success: false,
        params: { id: groupId },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar el grupo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar el grupo "${group?.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      setIsDeletingGroup(true);
      const response = await groupsApi.delete(groupId);
      apiLogger.groups({
        endpoint: 'delete',
        success: response.success,
        params: { id: groupId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Grupo eliminado exitosamente');
        router.push('/dashboard/groups');
      } else {
        toast.error('Error al eliminar el grupo');
      }
    } catch (error: any) {
      apiLogger.groups({
        endpoint: 'delete',
        success: false,
        params: { id: groupId },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al eliminar el grupo');
    } finally {
      setIsDeletingGroup(false);
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
    setValueExpense('shares', shares);
    shareFields.forEach((_, index) => removeShare(index));
    shares.forEach(share => appendShare(share));
  };

  const handleCreateExpense = async (data: CreateExpenseFormData) => {
    try {
      setIsSubmitting(true);
      const request: CreateExpenseRequest = {
        amount: data.amount,
        description: data.description,
        date: data.date,
        currency: data.currency || 'USD',
        location: data.location,
        notes: data.notes,
        groupId,
        paidById: data.paidById,
        shares: data.shares,
      };
      const response = await expensesApi.create(request);
      apiLogger.expenses({
        endpoint: 'create',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Gasto creado exitosamente');
        setExpenseDialogOpen(false);
        resetExpense();
        await loadExpenses();
      } else {
        toast.error('Error al crear el gasto');
      }
    } catch (error: any) {
      apiLogger.expenses({
        endpoint: 'create',
        success: false,
        params: { request: data },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al crear el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async (data: UpdateExpenseFormData) => {
    if (!editingExpense) return;
    try {
      setIsSubmitting(true);
      const request: UpdateExpenseRequest = {
        amount: data.amount,
        description: data.description,
        date: data.date,
        currency: data.currency,
        location: data.location,
        notes: data.notes,
      };
      const response = await expensesApi.update(editingExpense.id, request);
      apiLogger.expenses({
        endpoint: 'update',
        success: response.success,
        params: { id: editingExpense.id, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Gasto actualizado exitosamente');
        setEditingExpense(null);
        await loadExpenses();
      } else {
        toast.error('Error al actualizar el gasto');
      }
    } catch (error: any) {
      apiLogger.expenses({
        endpoint: 'update',
        success: false,
        params: { id: editingExpense.id },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    if (!window.confirm('¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.')) {
      setDeleteExpenseId(null);
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await expensesApi.delete(deleteExpenseId);
      apiLogger.expenses({
        endpoint: 'delete',
        success: response.success,
        params: { id: deleteExpenseId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Gasto eliminado exitosamente');
        setDeleteExpenseId(null);
        await loadExpenses();
      } else {
        toast.error('Error al eliminar el gasto');
      }
    } catch (error: any) {
      apiLogger.expenses({
        endpoint: 'delete',
        success: false,
        params: { id: deleteExpenseId },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al eliminar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: 'ADMIN' | 'MEMBER' | 'GUEST' | 'ASSISTANT') => {
    const member = group?.members.find(m => m.id === memberId);
    if (!member) return;
    try {
      setIsSubmitting(true);
      const request: UpdateGroupMemberRequest = { role };
      const response = await groupsApi.updateMember(groupId, member.user.id, request);
      apiLogger.groups({
        endpoint: 'updateMember',
        success: response.success,
        params: { groupId, userId: member.user.id, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Rol del miembro actualizado');
        setEditingMember(null);
        await loadGroup();
      } else {
        toast.error('Error al actualizar el rol');
      }
    } catch (error: any) {
      apiLogger.groups({
        endpoint: 'updateMember',
        success: false,
        params: { groupId, userId: member.user.id },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar el rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteMemberId) return;
    const member = group?.members.find(m => m.id === deleteMemberId);
    if (!member) return;
    if (!window.confirm(`¿Estás seguro de eliminar a ${member.user.name} ${member.user.lastName} del grupo?`)) {
      setDeleteMemberId(null);
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await groupsApi.removeMember(groupId, member.user.id);
      apiLogger.groups({
        endpoint: 'removeMember',
        success: response.success,
        params: { groupId, userId: member.user.id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Miembro eliminado exitosamente');
        setDeleteMemberId(null);
        await loadGroup();
      } else {
        toast.error('Error al eliminar el miembro');
      }
    } catch (error: any) {
      apiLogger.groups({
        endpoint: 'removeMember',
        success: false,
        params: { groupId, userId: member.user.id },
        error,
      });
      toast.error(error.response?.data?.message || 'Error al eliminar el miembro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || inviteEmail.trim().length < 5) {
      toast.error('Ingresa un correo válido para enviar invitación');
      return;
    }
    setIsSubmitting(true);
    const payload = { email: inviteEmail.trim() };
    try {
      const res = await groupInvitationsApi.createTargeted(groupId, payload);
      apiLogger.groups({ endpoint: 'group-invitations.createTargeted', success: res.success, params: { groupId, ...payload }, data: res.data, error: res.success ? null : res });
      if (res.success) {
        toast.success('Invitación enviada');
        setInviteOpen(false);
        setInviteEmail('');
        return;
      }
      const adminRes = await adminApi.createGroupInvitation({ groupId, ...payload } as any);
      apiLogger.groups({ endpoint: 'admin.createGroupInvitation', success: adminRes.success, params: { groupId, ...payload }, data: adminRes.data, error: adminRes.success ? null : adminRes });
      if (adminRes.success) {
        toast.success('Invitación enviada (admin)');
        setInviteOpen(false);
        setInviteEmail('');
        return;
      }
      toast.error(adminRes.message || 'No se pudo crear la invitación');
    } catch (error1: any) {
      const status1 = error1?.response?.status;
      apiLogger.groups({ endpoint: 'group-invitations.createTargeted', success: false, params: { groupId, ...payload }, error: error1 });
      if (status1 === 409) {
        toast.error('Ya existe una invitación pendiente para este correo o el usuario ya es miembro.');
        setIsSubmitting(false);
        return;
      }
      if (status1 === 410) {
        toast.error('La invitación está expirada o inactiva.');
        setIsSubmitting(false);
        return;
      }
      try {
        const adminRes = await adminApi.createGroupInvitation({ groupId, ...payload } as any);
        apiLogger.groups({ endpoint: 'admin.createGroupInvitation', success: adminRes.success, params: { groupId, ...payload }, data: adminRes.data, error: adminRes.success ? null : adminRes });
        if (adminRes.success) {
          toast.success('Invitación enviada (admin)');
          setInviteOpen(false);
          setInviteEmail('');
          return;
        }
        toast.error(adminRes.message || 'No se pudo crear la invitación');
      } catch (error2: any) {
        const status = error2?.response?.status;
        if (status === 403) {
          toast.error('No tienes permisos para enviar invitaciones.');
        } else if (status === 401) {
          toast.error('Sesión expirada. Inicia sesión nuevamente.');
        } else if (status === 404) {
          toast.error('Endpoint de invitaciones no disponible. Verificar backend.');
        } else {
          toast.error(error2?.response?.data?.message || 'Error al enviar invitación');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!addUserId || addUserId.trim().length < 1) {
      toast.error('Ingresa un ID de usuario válido');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await groupsApi.addMember(groupId, addUserId.trim());
      apiLogger.groups({ endpoint: 'groups.addMember', success: res.success, params: { groupId, userId: addUserId }, data: res.data, error: res.success ? null : res });
      if (res.success) {
        toast.success('Miembro agregado');
        setInviteOpen(false);
        setAddUserId('');
        await loadGroup();
      } else {
        toast.error(res.message || 'No se pudo agregar el miembro');
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('No tienes permisos para agregar miembros.');
      } else if (status === 401) {
        toast.error('Sesión expirada. Inicia sesión nuevamente.');
      } else {
        toast.error(error?.response?.data?.message || 'Error al agregar miembro');
      }
      apiLogger.groups({ endpoint: 'groups.addMember', success: false, params: { groupId, userId: addUserId }, error });
    } finally {
      setIsSubmitting(false);
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

  if (!group) {
    return <ErrorMessage message="Grupo no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/groups">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">{group.description || 'Detalle del grupo'}</p>
        </div>
        {canEditGroup && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditingGroup(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteGroup} disabled={isDeletingGroup}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeletingGroup ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">
            <Info className="h-4 w-4 mr-2" />
            Información
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="h-4 w-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <CheckSquare className="h-4 w-4 mr-2" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Miembros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Grupo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingGroup ? (
                <form onSubmit={handleSubmitGroup(handleUpdateGroup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input id="name" {...registerGroup('name')} />
                    {errorsGroup.name && <p className="text-sm text-destructive">{errorsGroup.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input id="description" {...registerGroup('description')} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditingGroup(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="text-lg font-semibold">{group.name}</p>
                  </div>
                  {group.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="text-sm">{group.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Creado por</p>
                    <p className="text-sm">
                      {group.createdBy.name} {group.createdBy.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Miembros</p>
                    <p className="text-sm">{group.members.length} miembros</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gastos del Grupo</CardTitle>
                <Button size="sm" onClick={() => setExpenseDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay gastos registrados</p>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{expense.description}</h3>
                            <Badge variant="outline">{formatCurrency(expense.amount, expense.currency)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Pagado por: {expense.paidBy.name} {expense.paidBy.lastName}</p>
                            <p>Fecha: {formatDate(expense.date, 'PP', 'es')}</p>
                            {expense.location && <p>Ubicación: {expense.location}</p>}
                            {expense.notes && <p>Notas: {expense.notes}</p>}
                            {expense.shares.length > 0 && (
                              <p>Participaciones: {expense.shares.length}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteExpenseId(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <GroupKanban groupId={groupId} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Miembros del Grupo</CardTitle>
                {canManageMembers && (
                  <Button size="sm" onClick={() => setInviteOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invitar miembro
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.user.name} {member.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingMember === member.id ? (
                        <Select
                          defaultValue={member.role}
                          onValueChange={(value) => {
                            handleUpdateMemberRole(member.id, value as 'ADMIN' | 'MEMBER' | 'GUEST' | 'ASSISTANT');
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Miembro</SelectItem>
                            <SelectItem value="GUEST">Invitado</SelectItem>
                            <SelectItem value="ASSISTANT">Asistente</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="capitalize">{member.role}</Badge>
                      )}
                      {canManageMembers && (
                        <div className="flex gap-1">
                          {editingMember !== member.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMember(member.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {member.user.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteMemberId(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar o agregar miembro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Invitar por correo</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Se enviará una invitación al correo indicado</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-user">Agregar usuario existente por ID</Label>
                  <Input
                    id="add-user"
                    placeholder="ID del usuario (UUID)"
                    value={addUserId}
                    onChange={(e) => setAddUserId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Requiere conocer el ID del usuario registrado</p>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddMember} disabled={isSubmitting || !canManageMembers} variant="secondary">
                  {isSubmitting ? 'Agregando...' : 'Agregar por ID'}
                </Button>
                <Button onClick={handleInvite} disabled={isSubmitting || !canManageMembers}>
                  {isSubmitting ? 'Enviando...' : 'Enviar invitación'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Dialog para crear gasto */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitExpense(handleCreateExpense)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input id="amount" type="number" step="0.01" {...registerExpense('amount', { valueAsNumber: true })} />
                {errorsExpense.amount && <p className="text-sm text-destructive">{errorsExpense.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input id="date" type="date" {...registerExpense('date')} />
                {errorsExpense.date && <p className="text-sm text-destructive">{errorsExpense.date.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input id="description" {...registerExpense('description')} />
              {errorsExpense.description && <p className="text-sm text-destructive">{errorsExpense.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" placeholder="USD" {...registerExpense('currency')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" {...registerExpense('location')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input id="notes" {...registerExpense('notes')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidById">Pagado por *</Label>
              <select
                id="paidById"
                {...registerExpense('paidById')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar</option>
                {groupMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.lastName}
                  </option>
                ))}
              </select>
              {errorsExpense.paidById && <p className="text-sm text-destructive">{errorsExpense.paidById.message}</p>}
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
                      {...registerExpense(`shares.${index}.userId`)}
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
                      {...registerExpense(`shares.${index}.amount`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Tipo</Label>
                    <select
                      {...registerExpense(`shares.${index}.type`)}
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
              {errorsExpense.shares && <p className="text-sm text-destructive">{errorsExpense.shares.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExpenseDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Gasto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar gasto */}
      {editingExpense && (
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Gasto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitUpdateExpense(handleUpdateExpense)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Monto</Label>
                  <Input id="edit-amount" type="number" step="0.01" {...registerUpdateExpense('amount', { valueAsNumber: true })} />
                  {errorsUpdateExpense.amount && <p className="text-sm text-destructive">{errorsUpdateExpense.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha</Label>
                  <Input id="edit-date" type="date" {...registerUpdateExpense('date')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input id="edit-description" {...registerUpdateExpense('description')} />
                {errorsUpdateExpense.description && <p className="text-sm text-destructive">{errorsUpdateExpense.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Moneda</Label>
                  <Input id="edit-currency" {...registerUpdateExpense('currency')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ubicación</Label>
                  <Input id="edit-location" {...registerUpdateExpense('location')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Input id="edit-notes" {...registerUpdateExpense('notes')} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingExpense(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para confirmar eliminación de gasto */}
      <Dialog open={!!deleteExpenseId} onOpenChange={(open) => !open && setDeleteExpenseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExpenseId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense} disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación de miembro */}
      <Dialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de eliminar este miembro del grupo? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMemberId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
