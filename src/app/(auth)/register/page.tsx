'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { setToken, setRefreshToken, getUserRole } from '@/lib/auth/token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phoneNumber: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken: setStoreToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.success) {
        setToken(response.data.token);
        setRefreshToken(response.data.refreshToken);
        setStoreToken(response.data.token);
        setUser(response.data.user);
        
        // Guardar usuario en localStorage para restauración de sesión
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Obtener el role del usuario desde el objeto user (el API lo devuelve ahí)
        const userRole = response.data.user.role;
        
        // También intentar obtener del token como fallback
        const tokenRole = getUserRole(response.data.token);
        
        // Mostrar el role en consola
        console.log('🔐 Registro exitoso');
        console.log('👤 Usuario:', response.data.user.email);
        console.log('🎭 User Role (desde user object):', userRole || 'No role found');
        console.log('🎭 User Role (desde token):', tokenRole || 'No role found');
        console.log('📦 Respuesta completa del API:', {
          user: response.data.user,
          token: response.data.token.substring(0, 20) + '...',
          roleFromUser: userRole,
          roleFromToken: tokenRole,
        });
        
        toast.success('Registro exitoso');
        
        // Redirigir según el role del usuario (priorizar role del objeto user)
        const finalRole = userRole || tokenRole;
        const userIsAdmin = finalRole && ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'].includes(finalRole.toUpperCase());
        
        if (userIsAdmin) {
          console.log('➡️ Redirigiendo a panel de administración (/admin)');
          router.push('/admin');
        } else {
          console.log('➡️ Redirigiendo a dashboard de usuario (/dashboard)');
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Crear Cuenta</CardTitle>
          <CardDescription className="text-sm sm:text-base">Completa el formulario para crear tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...register('name')} className="text-base sm:text-sm" />
                {errors.name && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...register('lastName')} className="text-base sm:text-sm" />
                {errors.lastName && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} className="text-base sm:text-sm" />
              {errors.email && (
                <p className="text-xs sm:text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register('password')} className="text-base sm:text-sm" />
              {errors.password && (
                <p className="text-xs sm:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono (opcional)</Label>
              <Input id="phoneNumber" type="tel" {...register('phoneNumber')} className="text-base sm:text-sm" />
            </div>
            <Button type="submit" className="w-full text-base sm:text-sm" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <div className="text-center text-xs sm:text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

