'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserResponse } from '@/types';
import { Mail, Phone, Calendar, Globe, DollarSign } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';

export default function UserDetailInfoTab({ user }: { user: UserResponse }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-semibold">
                {user.name[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name} {user.lastName}</h3>
              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phoneNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Registrado: {formatDate(user.createdAt, 'PP', 'es')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Moneda:</span>
            <Badge variant="outline">{user.currency}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Idioma:</span>
            <Badge variant="outline">{user.language}</Badge>
          </div>
          {user.role && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rol:</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

