'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageResponse } from '@/types';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils/cn';

interface MessageListProps {
  messages: MessageResponse[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  conversationId?: string;
}

export function MessageList({
  messages,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  conversationId,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const previousMessagesLengthRef = useRef(messages.length);

  // Auto-scroll al último mensaje cuando se agregan nuevos mensajes
  useEffect(() => {
    const currentLength = messages.length;
    const previousLength = previousMessagesLengthRef.current;

    // Si hay nuevos mensajes al final (mensajes más recientes)
    if (currentLength > previousLength && shouldAutoScroll && !isUserScrolling) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    previousMessagesLengthRef.current = currentLength;
  }, [messages.length, shouldAutoScroll, isUserScrolling]);

  // Detectar scroll del usuario
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearTop = target.scrollTop < 100;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

    setIsUserScrolling(true);
    setShouldAutoScroll(isNearBottom);

    // Cargar más mensajes cuando el usuario hace scroll hacia arriba
    if (isNearTop && hasMore && onLoadMore && !isLoading) {
      onLoadMore();
    }

    // Resetear después de un tiempo
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  // Determinar si mostrar nombre del remitente
  const shouldShowSenderName = (index: number): boolean => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    return currentMessage.sender?.id !== previousMessage.sender?.id;
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No hay mensajes. Comienza una conversación.</p>
      </div>
    );
  }

  return (
    <ScrollArea
      className="h-full w-full"
      onScrollCapture={handleScroll}
    >
      <div className="flex flex-col gap-4 p-4 min-h-full justify-end">
        {hasMore && (
          <div className="flex justify-center py-2">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <button
                onClick={onLoadMore}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cargar mensajes anteriores
              </button>
            )}
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            showSenderName={shouldShowSenderName(index)}
          />
        ))}
        <div ref={messagesEndRef} data-messages-end />
      </div>
    </ScrollArea>
  );
}

