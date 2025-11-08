'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Receipt, Wallet, MessageSquare, CheckSquare, Tag, UserCheck, UserPlus, Users } from 'lucide-react';
import GroupsListTab from './components/GroupsListTab';
import GroupsExpensesTab from './components/GroupsExpensesTab';
import GroupsBudgetsTab from './components/GroupsBudgetsTab';
import GroupsConversationsTab from './components/GroupsConversationsTab';
import GroupsTasksTab from './components/GroupsTasksTab';
import GroupsTagsTab from './components/GroupsTagsTab';
import GroupsMembersTab from './components/GroupsMembersTab';
import GroupsInvitationsTab from './components/GroupsInvitationsTab';
import GroupsCategoriesTab from './components/GroupsCategoriesTab';

export default function AdminGroupsPage() {
  const [activeTab, setActiveTab] = useState('lista');

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Grupos</h1>
        <p className="text-muted-foreground">Gestiona todos los grupos del sistema y su contenido relacionado</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap">
              <TabsTrigger value="lista">
                <Users className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="gastos">
                <Receipt className="h-4 w-4 mr-2" />
                Gastos
              </TabsTrigger>
              <TabsTrigger value="presupuestos">
                <Wallet className="h-4 w-4 mr-2" />
                Presupuestos
              </TabsTrigger>
              <TabsTrigger value="conversaciones">
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversaciones
              </TabsTrigger>
              <TabsTrigger value="tareas">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="etiquetas">
                <Tag className="h-4 w-4 mr-2" />
                Etiquetas
              </TabsTrigger>
              <TabsTrigger value="categorias">
                <Tag className="h-4 w-4 mr-2" />
                Categorías
              </TabsTrigger>
              <TabsTrigger value="miembros">
                <UserCheck className="h-4 w-4 mr-2" />
                Miembros
              </TabsTrigger>
              <TabsTrigger value="invitaciones">
                <UserPlus className="h-4 w-4 mr-2" />
                Invitaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="mt-6">
              <GroupsListTab />
            </TabsContent>

            <TabsContent value="gastos" className="mt-6">
              <GroupsExpensesTab />
            </TabsContent>

            <TabsContent value="presupuestos" className="mt-6">
              <GroupsBudgetsTab />
            </TabsContent>

            <TabsContent value="conversaciones" className="mt-6">
              <GroupsConversationsTab />
            </TabsContent>

            <TabsContent value="tareas" className="mt-6">
              <GroupsTasksTab />
            </TabsContent>

            <TabsContent value="etiquetas" className="mt-6">
              <GroupsTagsTab />
            </TabsContent>

            <TabsContent value="categorias" className="mt-6">
              <GroupsCategoriesTab />
            </TabsContent>

            <TabsContent value="miembros" className="mt-6">
              <GroupsMembersTab />
            </TabsContent>

            <TabsContent value="invitaciones" className="mt-6">
              <GroupsInvitationsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
