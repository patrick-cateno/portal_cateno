'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { getChatResponse, getConversationMessages } from '@/app/(app)/catia/actions';
import { WelcomeScreen } from './welcome-screen';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { ChatInput } from './chat-input';
import { ConversationList } from './conversation-list';
import type { Message } from '@/types/chat';

export function CatiaView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const result = await getChatResponse(messages.slice(-19), content.trim(), conversationId);

        if (!conversationId) {
          setConversationId(result.conversationId);
        }

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          timestamp: new Date(),
          status: 'error',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, conversationId],
  );

  const handleQuickAction = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage],
  );

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setInput('');
    setConversationId(null);
    setActiveTab('chat');
  }, []);

  const handleResumeConversation = useCallback(async (id: string) => {
    try {
      const msgs = await getConversationMessages(id);
      setMessages(msgs);
      setConversationId(id);
      setActiveTab('chat');
    } catch {
      // If conversation fails to load, stay on history
    }
  }, []);

  const hasMessages = messages.length > 0;

  if (activeTab === 'history') {
    return (
      <ConversationList onResume={handleResumeConversation} onBack={() => setActiveTab('chat')} />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {hasMessages && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">CatIA</h2>
            <p className="text-xs text-neutral-500">Assistente de aplicações</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              <History className="h-4 w-4" />
              Histórico
            </button>
            <button
              type="button"
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              <RotateCcw className="h-4 w-4" />
              Nova conversa
            </button>
          </div>
        </div>
      )}

      {/* Messages or Welcome */}
      {hasMessages ? (
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          role="log"
          aria-live="polite"
          aria-label="Mensagens do chat"
        >
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <WelcomeScreen
          onQuickAction={handleQuickAction}
          onOpenHistory={() => setActiveTab('history')}
        />
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage(input)}
        disabled={isLoading}
      />
    </div>
  );
}
