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
 * basándose en los miembros
 */
export function conversationMatchesGroup(
  conversation: ConversationResponse,
  group: GroupResponse
): boolean {
  if (conversation.type !== 'GROUP') {
    return false;
  }

  const groupUserIds = getGroupMemberUserIds(group);
  const conversationUserIds = conversation.members
    ?.map((member) => member.id)
    .filter(Boolean) || [];

  // Verificar que tengan la misma cantidad de miembros
  if (groupUserIds.length !== conversationUserIds.length) {
    return false;
  }

  // Verificar que todos los miembros del grupo estén en la conversación
  return groupUserIds.every((userId) => conversationUserIds.includes(userId));
}

