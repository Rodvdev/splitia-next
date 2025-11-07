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
import { adminApi } from '@/lib/api/admin';
import { CategoryResponse, UpdateCategoryRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Tag, Calendar, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const updateCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
  });

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  useEffect(() => {
    if (category && isEditing) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
    }
  }, [category, isEditing, reset]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getCategoryById(categoryId);
      apiLogger.categories({
        endpoint: 'getCategoryById',
        success: response.success,
        params: { id: categoryId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setCategory(response.data);
      }
    } catch (err: any) {
      apiLogger.categories({
        endpoint: 'getCategoryById',
        success: false,
        params: { id: categoryId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateCategoryFormData) => {
    setIsSaving(true);
    const request: UpdateCategoryRequest = {
      name: data.name,
      icon: data.icon,
      color: data.color,
    };
    try {
      const response = await adminApi.updateCategory(categoryId, request);
      apiLogger.categories({
        endpoint: 'updateCategory',
        success: response.success,
        params: { id: categoryId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Categoría actualizada exitosamente');
        setCategory(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.categories({
        endpoint: 'updateCategory',
        success: false,
        params: { id: categoryId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteCategory(categoryId);
      apiLogger.categories({
        endpoint: 'deleteCategory',
        success: response.success,
        params: { id: categoryId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Categoría eliminada correctamente');
        router.push('/admin/categories');
      }
    } catch (err: any) {
      apiLogger.categories({
        endpoint: 'deleteCategory',
        success: false,
        params: { id: categoryId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar la categoría');
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

  if (!category) {
    return <ErrorMessage message="Categoría no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">Detalle de la categoría</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Categoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm">{category.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {category.icon ? (
                        <span className="text-2xl">{category.icon}</span>
                      ) : (
                        <Tag className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Creado: {formatDate(category.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.icon && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Icono</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-sm">{category.icon}</span>
                    </div>
                  </div>
                )}
                {category.color && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Color</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-lg border-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{category.color}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!category.icon && !category.color && (
                  <p className="text-sm text-muted-foreground">Sin personalización visual</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Categoría
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Categoría'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icono</Label>
                  <Input id="icon" {...register('icon')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" type="color" {...register('color')} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

