'use client';

import { MessageResponse } from '@/types';
import { formatRelativeTime } from '@/lib/utils/format';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';
import { Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: MessageResponse;
  showSenderName?: boolean;
}

export function MessageBubble({ message, showSenderName = false }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwnMessage = user?.id === message.sender?.id;

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[70%] sm:max-w-[60%]',
        isOwnMessage ? 'ml-auto items-end' : 'items-start'
      )}
    >
      {showSenderName && !isOwnMessage && message.sender && (
        <span className="text-xs font-medium text-muted-foreground px-2">
          {message.sender.name} {message.sender.lastName}
        </span>
      )}
      <div
        className={cn(
          'rounded-2xl px-4 py-2 break-words',
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground',
          message.isAI && 'border border-primary/20'
        )}
      >
        <div className="flex items-start gap-2">
          {message.isAI && (
            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
      <div className={cn('flex items-center gap-2 px-2', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(message.createdAt)}
        </span>
        {message.isAI && (
          <span className="text-xs text-muted-foreground">AI</span>
        )}
      </div>
    </div>
  );
}

