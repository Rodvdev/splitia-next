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
import { CreateConversationRequest } from '@/types';
import { toast } from 'sonner';

const createConversationSchema = z.object({
  name: z.string().optional(),
  userIds: z.string().min(1, 'Debe incluir al menos un ID de usuario').transform((val) => val.split(',').map(id => id.trim()).filter(Boolean)),
});

type CreateConversationFormData = z.infer<typeof createConversationSchema>;

export default function CreateConversationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateConversationFormData>({
    resolver: zodResolver(createConversationSchema),
  });

  const onSubmit = async (data: CreateConversationFormData) => {
    setIsLoading(true);
    try {
      const request: CreateConversationRequest = {
        name: data.name,
        userIds: Array.isArray(data.userIds) ? data.userIds : [data.userIds],
      };
      const response = await adminApi.createConversation(request);
      if (response.success) {
        toast.success('Conversación creada exitosamente');
        router.push('/admin/conversations');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la conversación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/conversations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Conversación</h1>
          <p className="text-muted-foreground">Crea una nueva conversación en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Conversación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre (opcional)</Label>
              <Input id="name" placeholder="Nombre de la conversación" {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userIds">IDs de Usuarios (separados por comas)</Label>
              <Input id="userIds" placeholder="id1, id2, id3" {...register('userIds')} />
              {errors.userIds && <p className="text-sm text-destructive">{errors.userIds.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Conversación'}
              </Button>
              <Link href="/admin/conversations">
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

