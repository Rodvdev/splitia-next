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
import { CreateGroupInvitationRequest } from '@/types';
import { toast } from 'sonner';

const createGroupInvitationSchema = z.object({
  groupId: z.string().min(1, 'El ID del grupo es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  userId: z.string().optional().or(z.literal('')),
}).refine((data) => data.email || data.userId, {
  message: 'Debe proporcionar un email o un ID de usuario',
  path: ['email'],
});

type CreateGroupInvitationFormData = z.infer<typeof createGroupInvitationSchema>;

export default function CreateGroupInvitationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupInvitationFormData>({
    resolver: zodResolver(createGroupInvitationSchema),
  });

  const onSubmit = async (data: CreateGroupInvitationFormData) => {
    setIsLoading(true);
    try {
      const request: CreateGroupInvitationRequest = {
        groupId: data.groupId,
        email: data.email || undefined,
        userId: data.userId || undefined,
      };
      const response = await adminApi.createGroupInvitation(request);
      if (response.success) {
        toast.success('Invitación creada exitosamente');
        router.push('/admin/group-invitations');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la invitación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/group-invitations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Invitación</h1>
          <p className="text-muted-foreground">Crea una nueva invitación a un grupo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Invitación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupId">ID del Grupo</Label>
              <Input id="groupId" placeholder="UUID del grupo" {...register('groupId')} />
              {errors.groupId && <p className="text-sm text-destructive">{errors.groupId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional si se proporciona userId)</Label>
              <Input id="email" type="email" placeholder="usuario@email.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">ID del Usuario (opcional si se proporciona email)</Label>
              <Input id="userId" placeholder="UUID del usuario" {...register('userId')} />
              {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Invitación'}
              </Button>
              <Link href="/admin/group-invitations">
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

