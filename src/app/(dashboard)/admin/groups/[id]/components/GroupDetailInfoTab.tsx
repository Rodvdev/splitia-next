'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupResponse } from '@/types';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';

export default function GroupDetailInfoTab({ group }: { group: GroupResponse }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-sm">{group.id}</p>
            </div>
            {group.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm">{group.description}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Creado por: {group.createdBy.name} {group.createdBy.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Creado: {formatDate(group.createdAt, 'PP', 'es')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Miembros</p>
            <p className="text-2xl font-bold">{group.members.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

