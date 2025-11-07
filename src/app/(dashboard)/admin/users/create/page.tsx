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
import { CreateUserRequest } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phoneNumber: z.string().optional(),
  role: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true);
    const request: CreateUserRequest = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      role: data.role,
      currency: data.currency,
      language: data.language,
    };
    try {
      const response = await adminApi.createUser(request);
      apiLogger.users({
        endpoint: 'createUser',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Usuario creado exitosamente');
        router.push('/admin/users');
      }
    } catch (error: any) {
      apiLogger.users({
        endpoint: 'createUser',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Usuario</h1>
          <p className="text-muted-foreground">Crea un nuevo usuario en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Nombre" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" placeholder="Apellido" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="usuario@email.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="Contraseña" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono (opcional)</Label>
              <Input id="phoneNumber" type="tel" placeholder="+1234567890" {...register('phoneNumber')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" placeholder="USD" {...register('currency')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Input id="language" placeholder="es" {...register('language')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol (opcional)</Label>
              <Input id="role" placeholder="USER" {...register('role')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Usuario'}
              </Button>
              <Link href="/admin/users">
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

