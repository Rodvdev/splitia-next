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
import { CreateCategoryRequest, GroupResponse } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import { IconSelector } from '@/components/common/IconSelector';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';

const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  icon: z.string().optional(),
  color: z.string().optional(),
  groupId: z.string().min(1, 'Debes seleccionar un grupo'),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
  });

  const iconValue = watch('icon');
  const selectedGroupId = watch('groupId');

  const onSubmit = async (data: CreateCategoryFormData) => {
    setIsLoading(true);
    const request: CreateCategoryRequest = {
      name: data.name,
      icon: data.icon,
      color: data.color,
      groupId: data.groupId,
    };
    try {
      const response = await adminApi.createCategory(request);
      apiLogger.categories({
        endpoint: 'createCategory',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Categoría creada exitosamente');
        router.push('/admin/categories');
      }
    } catch (error: any) {
      apiLogger.categories({
        endpoint: 'createCategory',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Categoría</h1>
          <p className="text-muted-foreground">Crea una nueva categoría en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupId">Grupo *</Label>
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
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" placeholder="Nombre de la categoría" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icono (opcional)</Label>
                <div className="flex items-center gap-2">
                  <IconSelector
                    value={iconValue}
                    onSelect={(value) => {
                      setValue('icon', typeof value === 'string' ? value : '');
                    }}
                    type="both"
                  />
                  <Input 
                    id="icon" 
                    placeholder="O ingresa un emoji" 
                    {...register('icon')} 
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color (opcional)</Label>
                <Input id="color" type="color" {...register('color')} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Categoría'}
              </Button>
              <Link href="/admin/categories">
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

