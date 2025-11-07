'use client';

import { useState, useEffect } from 'react';
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
import { CreateTaskTagRequest, GroupResponse } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

const createTaskTagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  color: z.string().min(1, 'El color es requerido'),
  groupId: z.string().min(1, 'El grupo es requerido'),
});

type CreateTaskTagFormData = z.infer<typeof createTaskTagSchema>;

export default function CreateTaskTagPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTaskTagFormData>({
    resolver: zodResolver(createTaskTagSchema),
  });

  const colorValue = watch('color');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const response = await adminApi.getAllGroups({ page: 0, size: 100 });
      apiLogger.groups({
        endpoint: 'getAllGroups (for create tag)',
        success: response.success,
        params: { page: 0, size: 100 },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setGroups(extractDataFromResponse(response));
      }
    } catch (error) {
      apiLogger.groups({
        endpoint: 'getAllGroups (for create tag)',
        success: false,
        params: { page: 0, size: 100 },
        error: error,
      });
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: CreateTaskTagFormData) => {
    setIsLoading(true);
    const request: CreateTaskTagRequest = {
      name: data.name,
      color: data.color,
      groupId: data.groupId,
    };
    try {
      const response = await adminApi.createTaskTag(request);
      apiLogger.tags({
        endpoint: 'createTaskTag',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Etiqueta creada exitosamente');
        router.push('/admin/task-tags');
      }
    } catch (error: any) {
      apiLogger.tags({
        endpoint: 'createTaskTag',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la etiqueta');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/task-tags">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Etiqueta</h1>
          <p className="text-muted-foreground">Crea una nueva etiqueta de tarea en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Etiqueta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" placeholder="Nombre de la etiqueta" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <div className="flex gap-2">
                  <Input id="color" type="color" {...register('color')} className="w-20 h-10" />
                  <Input
                    id="colorHex"
                    placeholder="#FF0000"
                    value={colorValue || ''}
                    onChange={(e) => {
                      const input = document.getElementById('color') as HTMLInputElement;
                      if (input) {
                        input.value = e.target.value;
                      }
                    }}
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupId">Grupo *</Label>
                <select
                  id="groupId"
                  {...register('groupId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.groupId && <p className="text-sm text-destructive">{errors.groupId.message}</p>}
              </div>
            </div>
            {colorValue && (
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: colorValue }}
                  />
                  <span className="text-sm font-medium">{watch('name') || 'Nombre de la etiqueta'}</span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Etiqueta'}
              </Button>
              <Link href="/admin/task-tags">
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

