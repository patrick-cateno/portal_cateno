'use client';

import ReactMarkdown from 'react-markdown';
import { AppChip } from './app-chip';
import type { Message } from '@/types/chat';

interface Props {
  message: Message;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Parse [app:slug:name] patterns from content
function parseAppChips(content: string): { text: string; chips: { slug: string; name: string }[] } {
  const chips: { slug: string; name: string }[] = [];
  const text = content.replace(/\[app:([^:]+):([^\]]+)\]/g, (_, slug, name) => {
    chips.push({ slug, name });
    return '';
  });
  return { text: text.trim(), chips };
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const { text, chips } = parseAppChips(message.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-teal-600 text-neutral-50'
            : 'border border-teal-200 bg-white text-neutral-900 shadow-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm prose-strong:font-semibold max-w-none">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}

        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <AppChip key={chip.slug} slug={chip.slug} name={chip.name} />
            ))}
          </div>
        )}

        <span
          className={`mt-1 block text-right text-xs ${
            isUser ? 'text-teal-200' : 'text-neutral-400'
          }`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
