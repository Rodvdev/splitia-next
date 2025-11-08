'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gestiona documentos con versionado y control de acceso</p>
        </div>
        <Link href="/admin/documents/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No hay documentos"
            description="Comienza subiendo tu primer documento"
            action={
              <Link href="/admin/documents/upload">
                <Button>Subir Documento</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

