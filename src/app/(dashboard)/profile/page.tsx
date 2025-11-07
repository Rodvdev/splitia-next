'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usersApi } from '@/lib/api/users';
import { UserResponse } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { User, Mail, Phone, Calendar, Edit, Lock } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar el perfil';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              {error || 'No se pudo cargar la información del perfil'}
            </p>
            <Button onClick={loadUser} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal</p>
        </div>
        <Link href="/dashboard/profile/edit">
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p className="text-base font-medium">
                  {user.name} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
            </div>

            {user.phoneNumber && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-base font-medium">{user.phoneNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="text-base font-medium">
                  {format(new Date(user.createdAt), 'dd MMMM yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Moneda</p>
              <p className="text-base font-medium">{user.currency || 'USD'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Idioma</p>
              <p className="text-base font-medium">{user.language || 'Español'}</p>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Editar Preferencias
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/profile/edit">
            <Button variant="outline">
              Cambiar Contraseña
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

