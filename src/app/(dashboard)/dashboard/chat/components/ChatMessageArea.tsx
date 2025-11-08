'use client';

import { useState, useEffect, useRef } from 'react';
import { ConversationResponse, MessageResponse, SendMessageRequest } from '@/types';
import { chatApi } from '@/lib/api/chat';
import { MessageList } from './MessageList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Users, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';
import { toast } from 'sonner';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';

interface ChatMessageAreaProps {
  conversation: ConversationResponse | null;
  groupName?: string;
}

export function ChatMessageArea({ conversation, groupName }: ChatMessageAreaProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { subscribe, connected } = useWebSocket();
  const { user } = useAuthStore();
  const pageSize = 50;

  // Cargar mensajes cuando cambia la conversación
  useEffect(() => {
    if (!conversation?.id) {
      setMessages([]);
      setCurrentPage(0);
      return;
    }

    loadMessages(0, true);
  }, [conversation?.id]);

  // Suscripción a WebSocket para recibir mensajes en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SUPPORT_MESSAGES, (wsMessage) => {
      const { type, action, data } = wsMessage;
      
      if (type === 'MESSAGE_CREATED' || type === 'MESSAGE_RECEIVED' || action === 'CREATED') {
        const message = data.message || data as MessageResponse;
        
        if (!message) return;

        // Solo agregar si pertenece a la conversación actual
        if (conversation?.id && (!message.conversationId || message.conversationId === conversation.id)) {
          setMessages((prev) => {
            // Evitar duplicados
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });

          // Scroll al final si es un mensaje nuevo
          setTimeout(() => {
            const messagesEnd = document.querySelector('[data-messages-end]');
            messagesEnd?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else if (message.conversationId && message.conversationId !== conversation?.id) {
          // Notificación para mensajes de otras conversaciones
          const isOwnMessage = user?.id === message.sender?.id;
          if (!isOwnMessage) {
            toast.info(`Nuevo mensaje en ${groupName || 'otro grupo'}`, {
              description: `${message.sender?.name || 'Usuario'}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
            });
          }
        }
      } else if (type === 'MESSAGE_UPDATED' || action === 'UPDATED') {
        const message = data.message || data as MessageResponse;
        if (message && message.conversationId === conversation?.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === message.id ? message : m))
          );
        }
      } else if (type === 'MESSAGE_DELETED' || action === 'DELETED') {
        const messageId = data.id || wsMessage.entityId;
        if (messageId) {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
      }
    });

    return unsubscribe;
  }, [subscribe, connected, conversation?.id, groupName, user?.id]);

  const loadMessages = async (page: number = 0, reset: boolean = false) => {
    if (!conversation?.id || isLoading) return;

    try {
      setIsLoading(true);
      const response = await chatApi.getMessages(conversation.id, {
        page,
        size: pageSize,
        sort: ['createdAt,desc'], // Más recientes primero
      });

      apiLogger.general({
        endpoint: 'getMessages',
        success: response.success,
        params: { conversationId: conversation.id, page, size: pageSize },
        data: response.data,
        error: response.success ? null : response,
      });

      if (response.success && response.data) {
        const pageData = extractDataFromResponse(response);
        const newMessages = Array.isArray(pageData.content) ? pageData.content : [];
        
        // Invertir orden para mostrar más antiguos arriba y más recientes abajo
        const sortedMessages = [...newMessages].reverse();

        if (reset) {
          setMessages(sortedMessages);
        } else {
          // Agregar mensajes anteriores al inicio
          setMessages((prev) => [...sortedMessages, ...prev]);
        }

        setHasMore(!pageData.last);
        setCurrentPage(page);
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'getMessages',
        success: false,
        params: { conversationId: conversation.id, page },
        error: error,
      });
      console.error('Error loading messages:', error);
      toast.error('Error al cargar los mensajes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoading) return;
    loadMessages(currentPage + 1, false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation?.id || isSending) return;

    const content = messageText.trim();
    setMessageText('');
    setIsSending(true);

    // Optimistic update
    const optimisticMessage: MessageResponse = {
      id: `temp-${Date.now()}`,
      content,
      isAI: false,
      sender: user!,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const request: SendMessageRequest = {
        conversationId: conversation.id,
        content,
      };

      const response = await chatApi.sendMessage(request);

      apiLogger.general({
        endpoint: 'sendMessage',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });

      if (response.success && response.data) {
        // Reemplazar mensaje optimista con el real
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id ? response.data : m
          )
        );

        // Scroll al final
        setTimeout(() => {
          const messagesEnd = document.querySelector('[data-messages-end]');
          messagesEnd?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Remover mensaje optimista si falló
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        toast.error('Error al enviar el mensaje');
      }
    } catch (error: any) {
      apiLogger.general({
        endpoint: 'sendMessage',
        success: false,
        params: { conversationId: conversation.id },
        error: error,
      });
      // Remover mensaje optimista
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      toast.error(error.response?.data?.message || 'Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Selecciona un grupo para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  const displayName = groupName || conversation.name || 'Grupo sin nombre';
  const memberCount = conversation.members?.length || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
            </p>
          </div>
        </div>
        <Badge variant={connected ? 'default' : 'secondary'} className="gap-1">
          {connected ? (
            <>
              <Wifi className="h-3 w-3" />
              En línea
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Desconectado
            </>
          )}
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          conversationId={conversation.id}
        />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
            disabled={!connected || isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!connected || !messageText.trim() || isSending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!connected && (
          <p className="text-xs text-muted-foreground mt-2">
            Conectando al servidor...
          </p>
        )}
      </div>
    </div>
  );
}

