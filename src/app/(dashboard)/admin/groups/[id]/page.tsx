'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { adminApi } from '@/lib/api/admin';
import { GroupResponse, UpdateGroupRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Users, Calendar, User, Edit, Save, X, Receipt, Wallet, MessageSquare, Mail, CheckSquare, UserPlus, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import GroupDetailInfoTab from './components/GroupDetailInfoTab';
import GroupDetailExpensesTab from './components/GroupDetailExpensesTab';
import GroupDetailBudgetsTab from './components/GroupDetailBudgetsTab';
import GroupDetailConversationsTab from './components/GroupDetailConversationsTab';
import GroupDetailMessagesTab from './components/GroupDetailMessagesTab';
import GroupDetailTasksTab from './components/GroupDetailTasksTab';
import GroupDetailMembersTab from './components/GroupDetailMembersTab';
import GroupDetailInvitationsTab from './components/GroupDetailInvitationsTab';
import GroupDetailCategoriesTab from './components/GroupDetailCategoriesTab';

const updateGroupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateGroupFormData>({
    resolver: zodResolver(updateGroupSchema),
  });

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  useEffect(() => {
    if (group && isEditing) {
      reset({
        name: group.name,
        description: group.description,
        image: group.image,
      });
    }
  }, [group, isEditing, reset]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getGroupById(groupId);
      apiLogger.groups({
        endpoint: 'getGroupById',
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
        endpoint: 'getGroupById',
        success: false,
        params: { id: groupId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateGroupFormData) => {
    setIsSaving(true);
    const request: UpdateGroupRequest = {
      name: data.name,
      description: data.description,
      image: data.image,
    };
    try {
      const response = await adminApi.updateGroup(groupId, request);
      if (response.success) {
        toast.success('Grupo actualizado exitosamente');
        setGroup(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el grupo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteGroup(groupId);
      apiLogger.groups({
        endpoint: 'deleteGroup',
        success: response.success,
        params: { id: groupId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Grupo eliminado correctamente');
        router.push('/admin/groups');
      }
    } catch (err: any) {
      apiLogger.groups({
        endpoint: 'deleteGroup',
        success: false,
        params: { id: groupId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar el grupo');
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

  if (!group) {
    return <ErrorMessage message="Grupo no encontrado" />;
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">Editar grupo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" {...register('description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input id="image" type="url" {...register('image')} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">Detalle del grupo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap">
              <TabsTrigger value="informacion">
                <User className="h-4 w-4 mr-2" />
                Información
              </TabsTrigger>
              <TabsTrigger value="gastos">
                <Receipt className="h-4 w-4 mr-2" />
                Gastos
              </TabsTrigger>
              <TabsTrigger value="presupuestos">
                <Wallet className="h-4 w-4 mr-2" />
                Presupuestos
              </TabsTrigger>
              <TabsTrigger value="conversaciones">
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversaciones
              </TabsTrigger>
              <TabsTrigger value="mensajes">
                <Mail className="h-4 w-4 mr-2" />
                Mensajes
              </TabsTrigger>
              <TabsTrigger value="tareas">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="categorias">
                <Tag className="h-4 w-4 mr-2" />
                Categorías
              </TabsTrigger>
              <TabsTrigger value="miembros">
                <Users className="h-4 w-4 mr-2" />
                Miembros
              </TabsTrigger>
              <TabsTrigger value="invitaciones">
                <UserPlus className="h-4 w-4 mr-2" />
                Invitaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="mt-6">
              <GroupDetailInfoTab group={group} />
            </TabsContent>

            <TabsContent value="gastos" className="mt-6">
              <GroupDetailExpensesTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="presupuestos" className="mt-6">
              <GroupDetailBudgetsTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="conversaciones" className="mt-6">
              <GroupDetailConversationsTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="mensajes" className="mt-6">
              <GroupDetailMessagesTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="tareas" className="mt-6">
              <GroupDetailTasksTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="categorias" className="mt-6">
              <GroupDetailCategoriesTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="miembros" className="mt-6">
              <GroupDetailMembersTab group={group} />
            </TabsContent>

            <TabsContent value="invitaciones" className="mt-6">
              <GroupDetailInvitationsTab groupId={groupId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
