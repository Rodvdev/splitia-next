'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { CreateGroupUserRequest, GroupResponse, UserResponse } from '@/types';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

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
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateGroupUserFormData>({
    resolver: zodResolver(createGroupUserSchema),
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const selectedGroupId = watch('groupId');
  const selectedUserId = watch('userId');

  const onSubmit = async (data: CreateGroupUserFormData) => {
    setIsLoading(true);
    const request: CreateGroupUserRequest = {
      groupId: data.groupId,
      userId: data.userId,
      role: data.role,
    };
    try {
      const response = await adminApi.createGroupUser(request);
      apiLogger.general({
        endpoint: 'createGroupUser',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Miembro creado exitosamente');
        router.push('/admin/group-users');
      }
    } catch (error: any) {
      apiLogger.general({
        endpoint: 'createGroupUser',
        success: false,
        params: { request },
        error: error,
      });
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
              <Label htmlFor="groupId">Grupo</Label>
              <AsyncPaginatedSelect<GroupResponse>
                value={selectedGroupId}
                onChange={(val) => setValue('groupId', val)}
                placeholder="Seleccionar grupo"
                getOptionLabel={(g) => g.name}
                getOptionValue={(g) => g.id}
                fetchPage={async (page, size) => {
                  const res = await adminApi.getAllGroups({ page, size });
                  const data: any = res.data as any;
                  return {
                    items: Array.isArray(data?.content) ? (data.content as GroupResponse[]) : [],
                    total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                  };
                }}
              />
              {errors.groupId && <p className="text-sm text-destructive">{errors.groupId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">Usuario</Label>
              <AsyncPaginatedSelect<UserResponse>
                value={selectedUserId}
                onChange={(val) => setValue('userId', val)}
                placeholder="Seleccionar usuario"
                getOptionLabel={(u) => `${u.name} ${u.lastName} (${u.email})`}
                getOptionValue={(u) => u.id}
                fetchPage={async (page, size) => {
                  const res = await adminApi.getAllUsers({ page, size });
                  const data: any = res.data as any;
                  return {
                    items: Array.isArray(data?.content) ? (data.content as UserResponse[]) : [],
                    total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                  };
                }}
              />
              {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Miembro</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="GUEST">Invitado</SelectItem>
                      <SelectItem value="ASSISTANT">Asistente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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

