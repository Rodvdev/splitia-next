'use client';

import { GroupResponse, ConversationResponse } from '@/types';
import { formatRelativeTime } from '@/lib/utils/format';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface GroupConversationItemProps {
  group: GroupResponse;
  conversation: ConversationResponse | null;
  isSelected: boolean;
  onClick: () => void;
}

export function GroupConversationItem({
  group,
  conversation,
  isSelected,
  onClick,
}: GroupConversationItemProps) {
  const lastMessage = conversation?.lastMessage;
  const memberCount = group.members?.length || 0;
  const groupInitials = group.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted border-l-4 border-l-primary'
      )}
    >
      <Avatar className="h-12 w-12">
        {group.image ? (
          <img src={group.image} alt={group.name} />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary">
            {groupInitials || <Users className="h-5 w-5" />}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm truncate">{group.name}</h3>
          {lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          {lastMessage ? (
            <p className="text-xs text-muted-foreground truncate">
              {lastMessage.sender?.name}: {lastMessage.content}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

