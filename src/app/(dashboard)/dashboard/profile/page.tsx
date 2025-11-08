'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usersApi } from '@/lib/api/users';
import { UserResponse, GroupInvitationResponse } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { User, Mail, Phone, Calendar, Edit, Lock, UserPlus } from 'lucide-react';
import { groupInvitationsApi } from '@/lib/api/group-invitations';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<GroupInvitationResponse[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [manualToken, setManualToken] = useState<string>('');

  useEffect(() => {
    loadUser();
    loadInvitations();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar el perfil';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const res = await groupInvitationsApi.listMine();
      apiLogger.groups({ endpoint: 'group-invitations.listMine', success: res.success, params: {}, data: res.data, error: res.success ? null : res });
      setInvitations(extractDataFromResponse(res));
    } catch (err: any) {
      apiLogger.groups({ endpoint: 'group-invitations.listMine', success: false, params: {}, error: err });
      // Don't show error toast for invitations, just log it
      console.error('Error loading invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const acceptInvite = async (token?: string) => {
    if (!token) {
      toast.error('Invitación inválida (sin token)');
      return;
    }
    try {
      const res = await groupInvitationsApi.acceptByToken(token);
      apiLogger.groups({ endpoint: 'group-invitations.acceptByToken', success: res.success, params: { token }, data: res.data, error: res.success ? null : res });
      if (res.success) {
        toast.success('Invitación aceptada. Ya eres miembro del grupo.');
        await loadInvitations();
      } else {
        toast.error(res.message || 'No se pudo aceptar la invitación');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 410) {
        toast.error('La invitación expiró o está inactiva.');
      } else if (status === 404) {
        toast.error('Invitación no encontrada.');
      } else if (status === 403) {
        toast.error('No puedes aceptar esta invitación.');
      } else {
        toast.error(err?.response?.data?.message || 'Error al aceptar invitación');
      }
      apiLogger.groups({ endpoint: 'group-invitations.acceptByToken', success: false, params: { token }, error: err });
    }
  };

  const rejectInvite = async (token?: string) => {
    if (!token) {
      toast.error('Invitación inválida (sin token)');
      return;
    }
    try {
      const res = await groupInvitationsApi.rejectByToken(token);
      apiLogger.groups({ endpoint: 'group-invitations.rejectByToken', success: res.success, params: { token }, data: res.data, error: res.success ? null : res });
      if (res.success) {
        toast.success('Invitación rechazada.');
        await loadInvitations();
      } else {
        toast.error(res.message || 'No se pudo rechazar la invitación');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 410) {
        toast.error('La invitación ya no está activa.');
      } else if (status === 404) {
        toast.error('Invitación no encontrada.');
      } else if (status === 403) {
        toast.error('No puedes rechazar esta invitación.');
      } else {
        toast.error(err?.response?.data?.message || 'Error al rechazar invitación');
      }
      apiLogger.groups({ endpoint: 'group-invitations.rejectByToken', success: false, params: { token }, error: err });
    }
  };

  const acceptInviteManual = async () => {
    if (!manualToken.trim()) {
      toast.error('Ingresa un token válido');
      return;
    }
    await acceptInvite(manualToken.trim());
    setManualToken('');
  };

  const rejectInviteManual = async () => {
    if (!manualToken.trim()) {
      toast.error('Ingresa un token válido');
      return;
    }
    await rejectInvite(manualToken.trim());
    setManualToken('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Perfil</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona tu información personal</p>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-destructive">
              {error || 'No se pudo cargar la información del perfil'}
            </p>
            <Button onClick={loadUser} className="mt-4 w-full sm:w-auto">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Perfil</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona tu información personal</p>
        </div>
        <Link href="/dashboard/profile/edit" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p className="text-base font-medium">
                  {user.name} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
            </div>

            {user.phoneNumber && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-base font-medium">{user.phoneNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="text-base font-medium">
                  {format(new Date(user.createdAt), 'dd MMMM yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Moneda</p>
              <p className="text-base font-medium">{user.currency || 'USD'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Idioma</p>
              <p className="text-base font-medium">{user.language || 'Español'}</p>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Editar Preferencias
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/profile/edit">
            <Button variant="outline">
              Cambiar Contraseña
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Mis Invitaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fallback manual por token */}
          <div className="space-y-2 pb-4 border-b">
            <p className="text-sm text-muted-foreground">Acciones manuales por token</p>
            <Input
              placeholder="Pega aquí el token de invitación"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={acceptInviteManual} size="sm" className="bg-green-600 hover:bg-green-700">
                Aceptar por token
              </Button>
              <Button variant="destructive" size="sm" onClick={rejectInviteManual}>
                Rechazar por token
              </Button>
            </div>
          </div>

          {loadingInvitations ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : invitations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tienes invitaciones pendientes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <Card key={inv.id} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {inv.group?.name ?? 'Grupo'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Invitado por: {inv.invitedBy?.name ?? inv.invitedBy?.email ?? 'Usuario'}
                    </div>
                    {inv.email && (
                      <div className="text-sm text-muted-foreground">Para: {inv.email}</div>
                    )}
                    <div className="text-sm">
                      Estado: <span className="font-medium">{inv.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Creado: {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>

                    {inv.status === 'PENDING' ? (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => acceptInvite(inv.token)} 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aceptar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => rejectInvite(inv.token)}
                        >
                          Rechazar
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground pt-2">
                        No hay acciones disponibles para este estado.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

