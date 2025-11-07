import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Mensajes y conversaciones</p>
      </div>

      <EmptyState
        title="No hay conversaciones"
        description="Inicia una conversación para empezar a chatear"
      />
    </div>
  );
}

