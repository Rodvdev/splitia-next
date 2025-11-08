'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Key, Webhook } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integraciones</h1>
        <p className="text-muted-foreground">Gestiona API keys, webhooks e integraciones</p>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="connectors">Conectores</TabsTrigger>
        </TabsList>
        <TabsContent value="api-keys" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>API Keys</CardTitle>
              <Link href="/admin/integrations/api-keys/create">
                <Button size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Crear API Key
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No hay API keys"
                description="Crea una API key para acceder a la API"
                action={
                  <Link href="/admin/integrations/api-keys/create">
                    <Button>Crear API Key</Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Webhooks</CardTitle>
              <Link href="/admin/integrations/webhooks/create">
                <Button size="sm">
                  <Webhook className="h-4 w-4 mr-2" />
                  Crear Webhook
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No hay webhooks"
                description="Crea un webhook para recibir notificaciones en tiempo real"
                action={
                  <Link href="/admin/integrations/webhooks/create">
                    <Button>Crear Webhook</Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="connectors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Conectores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Slack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Configurar</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Configurar</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Google Sheets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Configurar</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

