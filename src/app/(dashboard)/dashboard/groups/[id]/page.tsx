'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupsApi } from '@/lib/api/groups';
import { GroupResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Users, Receipt, CheckSquare, Info } from 'lucide-react';
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

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [addUserId, setAddUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

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

  const canManageMembers = (() => {
    if (!group || !user) return false;
    return group.members.some((m) => m.user.id === user.id && m.role === 'ADMIN');
  })();

  const handleInvite = async () => {
    if (!inviteEmail || inviteEmail.trim().length < 5) {
      toast.error('Ingresa un correo válido para enviar invitación');
      return;
    }
    setIsSubmitting(true);
    const payload = { email: inviteEmail.trim() };
    try {
      // 1) Intento endpoint público (nuevo: targeted)
      const res = await groupInvitationsApi.createTargeted(groupId, payload);
      apiLogger.groups({ endpoint: 'group-invitations.createTargeted', success: res.success, params: { groupId, ...payload }, data: res.data, error: res.success ? null : res });
      if (res.success) {
        toast.success('Invitación enviada');
        setInviteOpen(false);
        setInviteEmail('');
        return;
      }
      // Si respondió 200 pero success=false, intentar admin (fallback)
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
      // 2) Si el endpoint público falla (403/404/409/410/500), manejar y/o intentar admin
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
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">{group.description || 'Detalle del grupo'}</p>
        </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gastos del Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Los gastos del grupo se mostrarán aquí.</p>
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
                {canManageMembers ? (
                  <Button size="sm" onClick={() => setInviteOpen(true)}>Invitar miembro</Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Solo el administrador del grupo puede invitar o agregar miembros</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {member.user.name} {member.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    <span className="text-sm font-medium capitalize">{member.role}</span>
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
    </div>
  );
}

