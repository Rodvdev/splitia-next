'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { adminApi } from '@/lib/api/admin';
import { ConversationResponse, MessageResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, MessageSquare, Mail, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

function ConversationsList() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllConversations({ page: 0, size: 50 });
      apiLogger.conversations({
        endpoint: 'getAllConversations',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setConversations(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.conversations({
        endpoint: 'getAllConversations',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const members = Array.isArray(conversation.members) ? conversation.members : [];
    const term = (searchTerm || '').toLowerCase();
    return members.some((p) => {
      const name = (p?.name || '').toLowerCase();
      const email = (p?.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por participantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/admin/conversations/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Conversación
          </Button>
        </Link>
      </div>

      {filteredConversations.length === 0 ? (
        <EmptyState
          title="No hay conversaciones"
          description={searchTerm ? 'No se encontraron conversaciones con ese criterio' : 'No hay conversaciones registradas'}
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Participantes</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Última Actualización</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversations.map((conversation) => (
                <tr key={conversation.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-xs">{conversation.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {conversation.members.slice(0, 3).map((participant) => (
                        <Badge key={participant.id} variant="outline" className="text-xs">
                          {participant.name} {participant.lastName}
                        </Badge>
                      ))}
                      {conversation.members.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{conversation.members.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(conversation.createdAt, 'PP', 'es')}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(conversation.updatedAt, 'PP', 'es')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/conversations/${conversation.id}`}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MessagesList() {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllMessages({ page: 0, size: 50 });
      apiLogger.messages({
        endpoint: 'getAllMessages',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setMessages(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.messages({
        endpoint: 'getAllMessages',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/admin/messages/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Mensaje
          </Button>
        </Link>
      </div>

      {filteredMessages.length === 0 ? (
        <EmptyState
          title="No hay mensajes"
          description={searchTerm ? 'No se encontraron mensajes con ese criterio' : 'No hay mensajes registrados'}
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Contenido</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Remitente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Es IA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">{truncateContent(message.content)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {message.sender.name} {message.sender.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {message.isAI ? (
                      <Badge variant="default">IA</Badge>
                    ) : (
                      <Badge variant="outline">Usuario</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(message.createdAt, 'PP', 'es')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/messages/${message.id}`}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function GroupsConversationsTab() {
  return (
    <Tabs defaultValue="conversaciones" className="w-full">
      <TabsList>
        <TabsTrigger value="conversaciones">
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversaciones
        </TabsTrigger>
        <TabsTrigger value="mensajes">
          <Mail className="h-4 w-4 mr-2" />
          Mensajes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="conversaciones" className="mt-4">
        <ConversationsList />
      </TabsContent>
      <TabsContent value="mensajes" className="mt-4">
        <MessagesList />
      </TabsContent>
    </Tabs>
  );
}

