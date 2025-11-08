'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ConversationResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminConversationsPage() {
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
    const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
    const term = (searchTerm || '').toLowerCase();
    return participants.some((p) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversaciones</h1>
          <p className="text-muted-foreground">Gestiona todas las conversaciones del sistema</p>
        </div>
        <Link href="/admin/conversations/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Conversación
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por participantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredConversations.length === 0 ? (
            <EmptyState
              title="No hay conversaciones"
              description={searchTerm ? 'No se encontraron conversaciones con ese criterio' : 'No hay conversaciones registradas'}
            />
          ) : (
            <div className="space-y-4">
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
                            {conversation.participants.slice(0, 3).map((participant) => (
                              <Badge key={participant.id} variant="outline" className="text-xs">
                                {participant.name} {participant.lastName}
                              </Badge>
                            ))}
                            {conversation.participants.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{conversation.participants.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(conversation.createdAt, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {conversation.updatedAt ? formatDate(conversation.updatedAt, 'PP', 'es') : '-'}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

