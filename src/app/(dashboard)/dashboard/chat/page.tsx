'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { MessageSquare, Info } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Chat</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Mensajes y conversaciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-muted-foreground">
            El sistema de chat está en desarrollo. Actualmente, el backend solo proporciona 
            endpoints para enviar y recibir mensajes dentro de conversaciones existentes. 
            La funcionalidad completa de listado de conversaciones y chat en tiempo real 
            estará disponible próximamente.
          </p>
        </CardContent>
      </Card>

      <EmptyState
        title="Chat en desarrollo"
        description="La funcionalidad de chat estará disponible próximamente. Podrás comunicarte con otros miembros de tus grupos y recibir asistencia del equipo de soporte."
        action={
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Próximamente</span>
          </div>
        }
      />
    </div>
  );
}

