'use client';

import { useState } from 'react';
import { ConversationResponse, GroupResponse } from '@/types';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessageArea } from './components/ChatMessageArea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectConversation = (conversation: ConversationResponse, group: GroupResponse) => {
    setSelectedConversation(conversation);
    setSelectedGroup(group);
    // En móvil, ocultar sidebar cuando se selecciona una conversación
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setSelectedConversation(null);
    setSelectedGroup(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden border-b p-4 bg-card flex items-center gap-3">
        {!showSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToSidebar}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat
        </h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-6 pb-4">
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Comunícate con tus grupos</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 flex-shrink-0 transition-transform duration-300',
            !showSidebar && 'hidden md:block'
          )}
        >
          <ChatSidebar
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Chat Area */}
        <div className={cn(
          'flex-1 flex flex-col',
          showSidebar && 'hidden md:flex'
        )}>
          <ChatMessageArea
            conversation={selectedConversation}
            groupName={selectedGroup?.name}
          />
        </div>
      </div>
    </div>
  );
}
