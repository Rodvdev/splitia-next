'use client';

import { useState, useEffect, useMemo } from 'react';
import { GroupResponse, ConversationResponse } from '@/types';
import { groupsApi } from '@/lib/api/groups';
import { chatApi } from '@/lib/api/chat';
import { GroupConversationItem } from './GroupConversationItem';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationResponse, group: GroupResponse) => void;
}

interface GroupWithConversation {
  group: GroupResponse;
  conversation: ConversationResponse | null;
  isLoading: boolean;
}

export function ChatSidebar({ selectedConversationId, onSelectConversation }: ChatSidebarProps) {
  const [groupsWithConversations, setGroupsWithConversations] = useState<GroupWithConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    loadGroupsAndConversations();
  }, []);

  // Suscripción a WebSocket para actualizar último mensaje en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.SUPPORT_MESSAGES, (wsMessage) => {
      const { type, action, data } = wsMessage;
      
      if (type === 'MESSAGE_CREATED' || type === 'MESSAGE_RECEIVED' || action === 'CREATED') {
        const message = data.message || data;
        if (message && message.conversationId) {
          // Actualizar último mensaje en la conversación correspondiente
          setGroupsWithConversations((prev) =>
            prev.map((item) => {
              if (item.conversation?.id === message.conversationId) {
                return {
                  ...item,
                  conversation: {
                    ...item.conversation!,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                  },
                };
              }
              return item;
            })
          );
        }
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);

  const loadGroupsAndConversations = async () => {
    try {
      setLoading(true);

      // 1. Cargar grupos
      const groupsResponse = await groupsApi.getAll({ page: 0, size: 100 });
      apiLogger.groups({
        endpoint: 'getAll',
        success: groupsResponse.success,
        params: { page: 0, size: 100 },
        data: groupsResponse.data,
        error: groupsResponse.success ? null : groupsResponse,
      });

      if (!groupsResponse.success || !groupsResponse.data) {
        setGroupsWithConversations([]);
        return;
      }

      const groups = extractDataFromResponse(groupsResponse);
      
      // 2. Para cada grupo, obtener o crear conversación
      const groupsWithConvs: GroupWithConversation[] = groups.map((group) => ({
        group,
        conversation: null,
        isLoading: true,
      }));

      setGroupsWithConversations(groupsWithConvs);

      // 3. Cargar conversaciones en paralelo
      const conversationPromises = groups.map(async (group) => {
        try {
          const convResponse = await chatApi.getOrCreateGroupConversation(group.id);
          if (convResponse.success && convResponse.data) {
            return { groupId: group.id, conversation: convResponse.data };
          }
          return { groupId: group.id, conversation: null };
        } catch (error) {
          console.error(`Error loading conversation for group ${group.id}:`, error);
          return { groupId: group.id, conversation: null };
        }
      });

      const conversationResults = await Promise.all(conversationPromises);

      // 4. Actualizar estado con conversaciones
      setGroupsWithConversations((prev) =>
        prev.map((item) => {
          const result = conversationResults.find((r) => r.groupId === item.group.id);
          return {
            ...item,
            conversation: result?.conversation || null,
            isLoading: false,
          };
        })
      );
    } catch (error) {
      apiLogger.groups({
        endpoint: 'getAll',
        success: false,
        params: {},
        error: error,
      });
      console.error('Error loading groups and conversations:', error);
      toast.error('Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return groupsWithConversations;
    }

    const term = searchTerm.toLowerCase();
    return groupsWithConversations.filter((item) =>
      item.group.name.toLowerCase().includes(term) ||
      item.group.description?.toLowerCase().includes(term)
    );
  }, [groupsWithConversations, searchTerm]);

  const handleSelectGroup = async (item: GroupWithConversation) => {
    // Si no existe conversación, crearla automáticamente
    if (!item.conversation) {
      try {
        // Mostrar loading en el item
        setGroupsWithConversations((prev) =>
          prev.map((g) =>
            g.group.id === item.group.id ? { ...g, isLoading: true } : g
          )
        );

        const convResponse = await chatApi.getOrCreateGroupConversation(item.group.id);
        
        if (convResponse.success && convResponse.data) {
          // Actualizar el estado con la nueva conversación
          setGroupsWithConversations((prev) =>
            prev.map((g) =>
              g.group.id === item.group.id
                ? { ...g, conversation: convResponse.data, isLoading: false }
                : g
            )
          );
          
          // Seleccionar la conversación recién creada
          onSelectConversation(convResponse.data, item.group);
          toast.success('Conversación iniciada');
        } else {
          toast.error('No se pudo crear la conversación del grupo');
          setGroupsWithConversations((prev) =>
            prev.map((g) =>
              g.group.id === item.group.id ? { ...g, isLoading: false } : g
            )
          );
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Error al crear la conversación');
        setGroupsWithConversations((prev) =>
          prev.map((g) =>
            g.group.id === item.group.id ? { ...g, isLoading: false } : g
          )
        );
      }
      return;
    }
    
    // Si ya existe, seleccionarla normalmente
    onSelectConversation(item.conversation, item.group);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Grupos
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Groups List */}
      <ScrollArea className="flex-1">
        {filteredGroups.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={searchTerm ? 'No se encontraron grupos' : 'No tienes grupos'}
              description={
                searchTerm
                  ? 'Intenta con otro término de búsqueda'
                  : 'Crea un grupo para comenzar a chatear'
              }
            />
          </div>
        ) : (
          <div>
            {filteredGroups.map((item) => (
              <GroupConversationItem
                key={item.group.id}
                group={item.group}
                conversation={item.conversation}
                isSelected={item.conversation?.id === selectedConversationId}
                onClick={() => handleSelectGroup(item)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

