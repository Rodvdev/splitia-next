'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function HREmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">Gestiona el equipo y recursos humanos</p>
        </div>
        <Link href="/admin/hr/employees/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Empleado
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No hay empleados"
            description="Comienza agregando empleados al sistema"
            action={
              <Link href="/admin/hr/employees/create">
                <Button>Crear Empleado</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

