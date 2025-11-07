'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { TaskTagResponse, UpdateTaskTagRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Edit, Save, X, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

const updateTaskTagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  color: z.string().min(1, 'El color es requerido').optional(),
});

type UpdateTaskTagFormData = z.infer<typeof updateTaskTagSchema>;

export default function TaskTagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;
  const [tag, setTag] = useState<TaskTagResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateTaskTagFormData>({
    resolver: zodResolver(updateTaskTagSchema),
  });

  const colorValue = watch('color');

  useEffect(() => {
    if (tagId) {
      loadTag();
    }
  }, [tagId]);

  useEffect(() => {
    if (tag && isEditing) {
      reset({
        name: tag.name,
        color: tag.color,
      });
    }
  }, [tag, isEditing, reset]);

  const loadTag = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getTaskTagById(tagId);
      if (response.success) {
        setTag(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la etiqueta');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateTaskTagFormData) => {
    setIsSaving(true);
    try {
      const request: UpdateTaskTagRequest = {
        name: data.name,
        color: data.color,
      };
      const response = await adminApi.updateTaskTag(tagId, request);
      if (response.success) {
        toast.success('Etiqueta actualizada exitosamente');
        setTag(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la etiqueta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta etiqueta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteTaskTag(tagId);
      if (response.success) {
        toast.success('Etiqueta eliminada correctamente');
        router.push('/admin/task-tags');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la etiqueta');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!tag) {
    return <ErrorMessage message="Etiqueta no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/task-tags">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <h1 className="text-3xl font-bold">Editar Etiqueta</h1>
          ) : (
            <h1 className="text-3xl font-bold">{tag.name}</h1>
          )}
          <p className="text-muted-foreground">Detalles de la etiqueta</p>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
              <X className="h-4 w-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
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
                {colorValue && (
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-full border"
                        style={{ backgroundColor: colorValue }}
                      />
                      <span className="text-sm font-medium">{watch('name') || tag.name}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="text-lg font-semibold">{tag.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.color}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grupo</p>
                  <p className="text-sm font-medium">{tag.group.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vista Previa</p>
                  <Badge style={{ backgroundColor: tag.color }} className="mt-1">
                    {tag.name}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Creación</p>
              <p className="text-sm">{formatDate(tag.createdAt, 'PP', 'es')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Actualización</p>
              <p className="text-sm">{formatDate(tag.updatedAt, 'PP', 'es')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

