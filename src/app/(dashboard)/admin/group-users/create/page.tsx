'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { CreateGroupUserRequest } from '@/types';
import { toast } from 'sonner';

const createGroupUserSchema = z.object({
  groupId: z.string().min(1, 'El ID del grupo es requerido'),
  userId: z.string().min(1, 'El ID del usuario es requerido'),
  role: z.enum(['ADMIN', 'MEMBER', 'GUEST', 'ASSISTANT']).optional(),
});

type CreateGroupUserFormData = z.infer<typeof createGroupUserSchema>;

export default function CreateGroupUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupUserFormData>({
    resolver: zodResolver(createGroupUserSchema),
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const onSubmit = async (data: CreateGroupUserFormData) => {
    setIsLoading(true);
    try {
      const request: CreateGroupUserRequest = {
        groupId: data.groupId,
        userId: data.userId,
        role: data.role,
      };
      const response = await adminApi.createGroupUser(request);
      if (response.success) {
        toast.success('Miembro creado exitosamente');
        router.push('/admin/group-users');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el miembro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/group-users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Miembro</h1>
          <p className="text-muted-foreground">Añade un nuevo miembro a un grupo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupId">ID del Grupo</Label>
              <Input id="groupId" placeholder="UUID del grupo" {...register('groupId')} />
              {errors.groupId && <p className="text-sm text-destructive">{errors.groupId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">ID del Usuario</Label>
              <Input id="userId" placeholder="UUID del usuario" {...register('userId')} />
              {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
            </div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Miembro'}
              </Button>
              <Link href="/admin/group-users">
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

