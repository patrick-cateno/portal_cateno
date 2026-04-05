'use client';

import { useRef, useCallback } from 'react';
import { Send } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSend();
        }
      }
    },
    [value, disabled, onSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
    }
  }, []);

  return (
    <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-4">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre apps, status, ou peça ajuda..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
