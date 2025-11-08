'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Receipt, Activity, Tag } from 'lucide-react';
import UsersListTab from './components/UsersListTab';
import UsersGroupsTab from './components/UsersGroupsTab';
import UsersExpensesTab from './components/UsersExpensesTab';
import UsersActivityTab from './components/UsersActivityTab';
import UsersCategoriesTab from './components/UsersCategoriesTab';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('lista');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona todos los usuarios del sistema y su información relacionada</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap">
              <TabsTrigger value="lista">
                <Users className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="grupos">
                <Users className="h-4 w-4 mr-2" />
                Grupos
              </TabsTrigger>
              <TabsTrigger value="gastos">
                <Receipt className="h-4 w-4 mr-2" />
                Gastos
              </TabsTrigger>
              <TabsTrigger value="categorias">
                <Tag className="h-4 w-4 mr-2" />
                Categorías
              </TabsTrigger>
              <TabsTrigger value="actividad">
                <Activity className="h-4 w-4 mr-2" />
                Actividad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="mt-6">
              <UsersListTab />
            </TabsContent>

            <TabsContent value="grupos" className="mt-6">
              <UsersGroupsTab />
            </TabsContent>

            <TabsContent value="gastos" className="mt-6">
              <UsersExpensesTab />
            </TabsContent>

            <TabsContent value="categorias" className="mt-6">
              <UsersCategoriesTab />
            </TabsContent>

            <TabsContent value="actividad" className="mt-6">
              <UsersActivityTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
