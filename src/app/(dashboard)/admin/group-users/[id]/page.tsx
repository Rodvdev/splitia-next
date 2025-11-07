'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { GroupUserResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Calendar, Tag, Users, User } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function GroupUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupUserId = params.id as string;
  const [groupUser, setGroupUser] = useState<GroupUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (groupUserId) {
      loadGroupUser();
    }
  }, [groupUserId]);

  const loadGroupUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getGroupUserById(groupUserId);
      if (response.success) {
        setGroupUser(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la relación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta relación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await adminApi.deleteGroupUser(groupUserId);
      if (response.success) {
        toast.success('Relación eliminada correctamente');
        router.push('/admin/group-users');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la relación');
    } finally {
      setDeleting(false);
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
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar Relación'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

