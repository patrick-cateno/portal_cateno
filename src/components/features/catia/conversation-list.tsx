'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, MessageSquare, Search, Trash2 } from 'lucide-react';

interface ConversationItem {
  id: string;
  title: string | null;
  updatedAt: string;
  preview: string;
}

interface Props {
  onResume: (id: string) => void;
  onBack: () => void;
}

export function ConversationList({ onResume, onBack }: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchConversations = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (q) params.set('q', q);
      const res = await fetch(`/api/catia/conversations?${params}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        total: number;
        items: ConversationItem[];
      };
      setConversations(data.items);
      setTotal(data.total);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations(page, search);
  }, [fetchConversations, page, search]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/catia/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao chat
        </button>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-200 py-1.5 pr-3 pl-9 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-teal-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-neutral-500">
            <MessageSquare className="h-10 w-10 text-neutral-300" />
            <p className="text-sm">
              {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
              >
                <button
                  type="button"
                  onClick={() => onResume(conv.id)}
                  className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                >
                  <span className="truncate text-sm font-medium text-neutral-800">
                    {conv.title ?? 'Conversa sem título'}
                  </span>
                  <span className="truncate text-xs text-neutral-500">
                    {formatDate(conv.updatedAt)} — {conv.preview || '...'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(conv.id)}
                  disabled={deleting === conv.id}
                  className="flex-shrink-0 rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Excluir"
                >
                  {deleting === conv.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500">
          <span>
            {total} conversa{total !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-neutral-200 px-2 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-neutral-200 px-2 py-1 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
