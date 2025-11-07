'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupUserResponse, UpdateGroupUserRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Calendar, Tag, Users, User, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const updateGroupUserSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'GUEST', 'ASSISTANT']).optional(),
});

type UpdateGroupUserFormData = z.infer<typeof updateGroupUserSchema>;

export default function GroupUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupUserId = params.id as string;
  const [groupUser, setGroupUser] = useState<GroupUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateGroupUserFormData>({
    resolver: zodResolver(updateGroupUserSchema),
  });

  useEffect(() => {
    if (groupUserId) {
      loadGroupUser();
    }
  }, [groupUserId]);

  useEffect(() => {
    if (groupUser && isEditing) {
      reset({
        role: groupUser.role,
      });
    }
  }, [groupUser, isEditing, reset]);

  const loadGroupUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getGroupUserById(groupUserId);
      apiLogger.general({
        endpoint: 'getGroupUserById',
        success: response.success,
        params: { id: groupUserId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setGroupUser(response.data);
      }
    } catch (err: any) {
      apiLogger.general({
        endpoint: 'getGroupUserById',
        success: false,
        params: { id: groupUserId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar la relación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateGroupUserFormData) => {
    setIsSaving(true);
    const request: UpdateGroupUserRequest = {
      role: data.role,
    };
    try {
      const response = await adminApi.updateGroupUser(groupUserId, request);
      apiLogger.general({
        endpoint: 'updateGroupUser',
        success: response.success,
        params: { id: groupUserId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Relación actualizada exitosamente');
        setGroupUser(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.general({
        endpoint: 'updateGroupUser',
        success: false,
        params: { id: groupUserId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la relación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta relación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteGroupUser(groupUserId);
      apiLogger.general({
        endpoint: 'deleteGroupUser',
        success: response.success,
        params: { id: groupUserId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Relación eliminada correctamente');
        router.push('/admin/group-users');
      }
    } catch (err: any) {
      apiLogger.general({
        endpoint: 'deleteGroupUser',
        success: false,
        params: { id: groupUserId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar la relación');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      MEMBER: 'Miembro',
      GUEST: 'Invitado',
      ASSISTANT: 'Asistente',
    };
    return labels[role] || role;
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

  if (!groupUser) {
    return <ErrorMessage message="Relación no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/group-users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Relación</h1>
          <p className="text-muted-foreground">Información completa de la relación grupo-usuario</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grupo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{groupUser.group.name}</p>
                    {groupUser.group.description && (
                      <p className="text-xs text-muted-foreground">{groupUser.group.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold">
                      {groupUser.user.name[0]}{groupUser.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{groupUser.user.name} {groupUser.user.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{groupUser.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm">{groupUser.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rol:</span>
                <Badge variant="outline">{getRoleLabel(groupUser.role)}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Se unió: {formatDate(groupUser.joinedAt, 'PP', 'es')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Relación
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Relación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Relación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select id="role" {...register('role')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="MEMBER">Miembro</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="GUEST">Invitado</option>
                  <option value="ASSISTANT">Asistente</option>
                </select>
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
      )}
    </div>
  );
}

