'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { groupsApi } from '@/lib/api/groups';
import { CreateGroupRequest } from '@/types';
import { apiLogger } from '@/lib/utils/api-logger';

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    const request: CreateGroupRequest = {
      name: name.trim(),
      description: description?.trim() || undefined,
    };
    try {
      setIsLoading(true);
      const response = await groupsApi.create(request);
      apiLogger.groups({
        endpoint: 'groups.create',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Grupo creado exitosamente');
        const newId = (response.data as any)?.id;
        if (newId) {
          router.push(`/dashboard/groups/${newId}`);
        } else {
          router.push('/dashboard/groups');
        }
      } else {
        toast.error(response.message || 'Error al crear el grupo');
      }
    } catch (error: any) {
      apiLogger.groups({ endpoint: 'groups.create', success: false, params: { request }, error });
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('No autorizado para crear grupos. Verifica tu plan o permisos.');
      } else if (status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        toast.error(error?.response?.data?.message || 'Error al crear el grupo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Grupo</h1>
        <p className="text-muted-foreground">Crea un nuevo grupo para compartir gastos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Grupo</Label>
              <Input id="name" placeholder="Ej: Viaje a París" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" placeholder="Descripción opcional" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Creando...' : 'Crear Grupo'}</Button>
              <Link href="/dashboard/groups">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

