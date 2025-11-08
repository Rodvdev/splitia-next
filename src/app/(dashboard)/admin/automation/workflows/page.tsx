'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';

export default function AutomationWorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Constructor visual de workflows y automatizaciones</p>
        </div>
        <Link href="/admin/automation/workflows/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Workflow
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflows Automatizados</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No hay workflows"
            description="Comienza creando tu primer workflow automatizado con el constructor visual"
            action={
              <Link href="/admin/automation/workflows/create">
                <Button>Crear Workflow</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

