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
import { CreateGroupRequest } from '@/types';
import { toast } from 'sonner';

const createGroupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  image: z.string().optional(),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export default function CreateGroupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (data: CreateGroupFormData) => {
    setIsLoading(true);
    try {
      const request: CreateGroupRequest = {
        name: data.name,
        description: data.description,
        image: data.image,
      };
      const response = await adminApi.createGroup(request);
      if (response.success) {
        toast.success('Grupo creado exitosamente');
        router.push('/admin/groups');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Grupo</h1>
          <p className="text-muted-foreground">Crea un nuevo grupo en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Nombre del grupo" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" placeholder="Descripción del grupo" {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL de Imagen (opcional)</Label>
              <Input id="image" type="url" placeholder="https://..." {...register('image')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Grupo'}
              </Button>
              <Link href="/admin/groups">
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

