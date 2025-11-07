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
import { GroupInvitationResponse, UpdateGroupInvitationRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, UserPlus, Calendar, Tag, Users, Mail, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const updateGroupInvitationSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
});

type UpdateGroupInvitationFormData = z.infer<typeof updateGroupInvitationSchema>;

export default function GroupInvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;
  const [invitation, setInvitation] = useState<GroupInvitationResponse | null>(null);
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
  } = useForm<UpdateGroupInvitationFormData>({
    resolver: zodResolver(updateGroupInvitationSchema),
  });

  useEffect(() => {
    if (invitationId) {
      loadInvitation();
    }
  }, [invitationId]);

  useEffect(() => {
    if (invitation && isEditing) {
      reset({
        status: invitation.status,
      });
    }
  }, [invitation, isEditing, reset]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getGroupInvitationById(invitationId);
      apiLogger.general({
        endpoint: 'getGroupInvitationById',
        success: response.success,
        params: { id: invitationId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setInvitation(response.data);
      }
    } catch (err: any) {
      apiLogger.general({
        endpoint: 'getGroupInvitationById',
        success: false,
        params: { id: invitationId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar la invitación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateGroupInvitationFormData) => {
    setIsSaving(true);
    const request: UpdateGroupInvitationRequest = {
      status: data.status,
    };
    try {
      const response = await adminApi.updateGroupInvitation(invitationId, request);
      apiLogger.general({
        endpoint: 'updateGroupInvitation',
        success: response.success,
        params: { id: invitationId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Invitación actualizada exitosamente');
        setInvitation(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.general({
        endpoint: 'updateGroupInvitation',
        success: false,
        params: { id: invitationId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la invitación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta invitación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteGroupInvitation(invitationId);
      apiLogger.general({
        endpoint: 'deleteGroupInvitation',
        success: response.success,
        params: { id: invitationId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Invitación eliminada correctamente');
        router.push('/admin/group-invitations');
      }
    } catch (err: any) {
      apiLogger.general({
        endpoint: 'deleteGroupInvitation',
        success: false,
        params: { id: invitationId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar la invitación');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptada',
      REJECTED: 'Rechazada',
      EXPIRED: 'Expirada',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      PENDING: 'outline',
      ACCEPTED: 'default',
      REJECTED: 'destructive',
      EXPIRED: 'outline',
    };
    return variants[status] || 'outline';
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

  if (!invitation) {
    return <ErrorMessage message="Invitación no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/group-invitations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Invitación</h1>
          <p className="text-muted-foreground">Información completa de la invitación</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Invitación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{invitation.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={getStatusVariant(invitation.status)}>
                      {getStatusLabel(invitation.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Creado: {formatDate(invitation.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grupo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.group.name}</p>
                    {invitation.group.description && (
                      <p className="text-xs text-muted-foreground">{invitation.group.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invitado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {invitation.invitedBy.name[0]}{invitation.invitedBy.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {invitation.invitedBy.name} {invitation.invitedBy.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{invitation.invitedBy.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuario Invitado</CardTitle>
              </CardHeader>
              <CardContent>
                {invitation.invitedUser ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {invitation.invitedUser.name[0]}{invitation.invitedUser.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {invitation.invitedUser.name} {invitation.invitedUser.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{invitation.invitedUser.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{invitation.email || 'No especificado'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Invitación
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Invitación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Invitación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select id="status" {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PENDING">Pendiente</option>
                  <option value="ACCEPTED">Aceptada</option>
                  <option value="REJECTED">Rechazada</option>
                  <option value="EXPIRED">Expirada</option>
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

