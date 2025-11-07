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
import { SendMessageRequest } from '@/types';
import { toast } from 'sonner';

const createMessageSchema = z.object({
  conversationId: z.string().min(1, 'El ID de conversación es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
});

type CreateMessageFormData = z.infer<typeof createMessageSchema>;

export default function CreateMessagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMessageFormData>({
    resolver: zodResolver(createMessageSchema),
  });

  const onSubmit = async (data: CreateMessageFormData) => {
    setIsLoading(true);
    try {
      const request: SendMessageRequest = {
        conversationId: data.conversationId,
        content: data.content,
      };
      const response = await adminApi.createMessage(request);
      if (response.success) {
        toast.success('Mensaje creado exitosamente');
        router.push('/admin/messages');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Mensaje</h1>
          <p className="text-muted-foreground">Crea un nuevo mensaje en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Mensaje</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conversationId">ID de Conversación</Label>
              <Input id="conversationId" placeholder="ID de la conversación" {...register('conversationId')} />
              {errors.conversationId && <p className="text-sm text-destructive">{errors.conversationId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Input id="content" placeholder="Contenido del mensaje" {...register('content')} />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Mensaje'}
              </Button>
              <Link href="/admin/messages">
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

