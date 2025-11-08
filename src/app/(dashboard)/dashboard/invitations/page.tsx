"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { groupInvitationsApi } from '@/lib/api/group-invitations';
import { GroupInvitationResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';
import { format } from 'date-fns';

export default function MyInvitationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<GroupInvitationResponse[]>([]);
  const [manualToken, setManualToken] = useState<string>('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await groupInvitationsApi.listMine();
      apiLogger.groups({ endpoint: 'group-invitations.listMine', success: res.success, params: {}, data: res.data, error: res.success ? null : res });
      setInvitations(extractDataFromResponse(res));
    } catch (err: any) {
      apiLogger.groups({ endpoint: 'group-invitations.listMine', success: false, params: {}, error: err });
      const status = err?.response?.status;
      if (status === 401) {
        setError('Sesión expirada. Inicia sesión nuevamente.');
      } else {
        setError(err?.response?.data?.message || 'Error al cargar invitaciones');
      }
    } finally {
      setLoading(false);
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
  };

  const rejectInviteManual = async () => {
    if (!manualToken.trim()) {
      toast.error('Ingresa un token válido');
      return;
    }
    await rejectInvite(manualToken.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis invitaciones</h1>
        <p className="text-muted-foreground">Invitaciones pendientes para unirte a grupos</p>
      </div>

      {/* Fallback manual por token, útil si el listado falla */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones manuales por token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Pega aquí el token de invitación"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={acceptInviteManual} className="bg-green-600 hover:bg-green-700">Aceptar por token</Button>
            <Button variant="destructive" onClick={rejectInviteManual}>Rechazar por token</Button>
          </div>
        </CardContent>
      </Card>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No tienes invitaciones pendientes.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((inv) => (
            <Card key={inv.id}>
              <CardHeader>
                <CardTitle>
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
                <div className="text-sm">Estado: <span className="font-medium">{inv.status}</span></div>
                <div className="text-xs text-muted-foreground">
                  Creado: {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>

                {inv.status === 'PENDING' ? (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => acceptInvite(inv.token)} className="bg-green-600 hover:bg-green-700">Aceptar</Button>
                    <Button variant="destructive" onClick={() => rejectInvite(inv.token)}>Rechazar</Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground pt-2">No hay acciones disponibles para este estado.</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}