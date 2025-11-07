'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groupsApi } from '@/lib/api/groups';
import { GroupResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Users, Receipt, CheckSquare, Info } from 'lucide-react';
import Link from 'next/link';
import { GroupKanban } from '@/components/kanban/GroupKanban';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupsApi.getById(groupId);
      if (response.success) {
        setGroup(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el grupo');
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

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!group) {
    return <ErrorMessage message="Grupo no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/groups">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">{group.description || 'Detalle del grupo'}</p>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">
            <Info className="h-4 w-4 mr-2" />
            Información
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="h-4 w-4 mr-2" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <CheckSquare className="h-4 w-4 mr-2" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Miembros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Grupo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="text-lg font-semibold">{group.name}</p>
              </div>
              {group.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm">{group.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Creado por</p>
                <p className="text-sm">
                  {group.createdBy.name} {group.createdBy.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miembros</p>
                <p className="text-sm">{group.members.length} miembros</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gastos del Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Los gastos del grupo se mostrarán aquí.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <GroupKanban groupId={groupId} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Miembros del Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {member.user.name} {member.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    <span className="text-sm font-medium capitalize">{member.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

