'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function ProcurementVendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground">Gestiona tus proveedores y partners</p>
        </div>
        <Link href="/admin/procurement/vendors/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Proveedor
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No hay proveedores"
            description="Comienza agregando proveedores al sistema"
            action={
              <Link href="/admin/procurement/vendors/create">
                <Button>Crear Proveedor</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

