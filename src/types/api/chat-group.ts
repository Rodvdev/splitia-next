import { GroupResponse, GroupMemberResponse } from './group';
import { ConversationResponse } from './conversation';

/**
 * Helper para obtener los userIds de los miembros de un grupo
 */
export function getGroupMemberUserIds(group: GroupResponse): string[] {
  if (!group.members || !Array.isArray(group.members)) {
    return [];
  }
  return group.members
    .map((member: GroupMemberResponse) => member.user?.id)
    .filter((id): id is string => Boolean(id));
}

/**
 * Tipo para mapear grupos a conversaciones
 */
export interface GroupConversation {
  group: GroupResponse;
  conversation: ConversationResponse | null;
  isLoading: boolean;
}

/**
 * Helper para verificar si una conversación pertenece a un grupo
 * Usa groupId si está disponible, sino verifica por coincidencia de participantes
 */
export function conversationMatchesGroup(
  conversation: ConversationResponse,
  group: GroupResponse
): boolean {
  if (!conversation.isGroupChat) {
    return false;
  }

  // Método más eficiente: verificar por groupId si está disponible
  if (conversation.groupId && conversation.groupId === group.id) {
    return true;
  }

  // Fallback: verificar por coincidencia de participantes
  const groupUserIds = getGroupMemberUserIds(group);
  const conversationUserIds = conversation.participants
    ?.map((participant) => participant.id)
    .filter(Boolean) || [];

  // Verificar que tengan la misma cantidad de participantes
  if (groupUserIds.length !== conversationUserIds.length) {
    return false;
  }

  // Verificar que todos los miembros del grupo estén en la conversación
  return groupUserIds.every((userId) => conversationUserIds.includes(userId));
}

