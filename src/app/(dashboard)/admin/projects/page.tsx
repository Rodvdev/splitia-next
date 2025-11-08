'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona proyectos, tareas y tiempo</p>
        </div>
        <Link href="/admin/projects/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Proyecto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No hay proyectos"
            description="Comienza creando tu primer proyecto"
            action={
              <Link href="/admin/projects/create">
                <Button>Crear Proyecto</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

