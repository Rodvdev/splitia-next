'use client';

import { useWebSocket } from '@/lib/websocket/WebSocketProvider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function WebSocketStatus() {
  const { connected } = useWebSocket();

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5',
        connected ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
      )}
    >
      {connected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span className="hidden sm:inline">Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="hidden sm:inline">Desconectado</span>
        </>
      )}
    </Badge>
  );
}

