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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken: setStoreToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  const handleDemoLogin = async (email: string, password: string) => {
    fillDemoCredentials(email, password);
    // Submit directly with demo credentials
    await onSubmit({ email, password });
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
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
        console.log('🔐 Inicio de sesión detectado');
        console.log('👤 Usuario:', response.data.user.email);
        console.log('🎭 User Role (desde user object):', userRole || 'No role found');
        console.log('🎭 User Role (desde token):', tokenRole || 'No role found');
        console.log('📦 Respuesta completa del API:', {
          user: response.data.user,
          token: response.data.token.substring(0, 20) + '...',
          roleFromUser: userRole,
          roleFromToken: tokenRole,
        });
        
        toast.success('Inicio de sesión exitoso');
        
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
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 401) {
        setErrorDialogOpen(true);
        reset({ email: '', password: '' });
      } else {
        const errorMessage = error instanceof Error 
          ? error.message 
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al iniciar sesión';
        console.error('❌ Error en inicio de sesión:', error);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription className="text-sm sm:text-base">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                className="text-base sm:text-sm"
              />
              {errors.email && (
                <p className="text-xs sm:text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="text-base sm:text-sm"
              />
              {errors.password && (
                <p className="text-xs sm:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full text-base sm:text-sm" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            
            {/* Botones de Demo */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin('admin@demo.com', 'demo123')}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                🔑 Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin('user@demo.com', 'demo123')}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                👤 User Demo
              </Button>
            </div>
            
            <div className="text-center text-xs sm:text-sm">
              <span className="text-muted-foreground">¿No tienes cuenta? </span>
              <Link href="/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credenciales incorrectas</DialogTitle>
            <DialogDescription>
              Inténtalo de nuevo. Hemos reiniciado los campos para que ingreses tu email y contraseña nuevamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

