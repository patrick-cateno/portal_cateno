'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Pencil, Archive, Search, X, Check } from 'lucide-react';
import Link from 'next/link';
import { archiveApplication } from '@/app/(app)/admin/aplicacoes/actions';
import { toast } from 'sonner';

interface AppRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  status: string;
  categoryName: string;
  userCount: number;
  lastHealthCheck: string | null;
}

interface Props {
  applications: AppRow[];
  search: string;
  status: string;
  page: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  online: 'bg-emerald-500',
  maintenance: 'bg-amber-500',
  offline: 'bg-red-500',
  archived: 'bg-gray-400',
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function AdminAppTable({ applications, search, status, page, totalPages }: Props) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search);
  const [isPending, startTransition] = useTransition();
  const [confirmingArchive, setConfirmingArchive] = useState<string | null>(null);

  function applyFilters(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();
    const s = overrides.search ?? searchValue;
    const st = overrides.status ?? status;
    if (s) params.set('search', s);
    if (st) params.set('status', st);
    startTransition(() => router.push(`/admin/aplicacoes?${params.toString()}`));
  }

  function confirmArchive(id: string) {
    startTransition(async () => {
      try {
        const result = await archiveApplication(id);
        if (result.success) {
          toast.success('Aplicação arquivada');
          router.refresh();
        }
      } catch {
        toast.error('Erro ao arquivar aplicação');
      } finally {
        setConfirmingArchive(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou slug..."
            className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-teal-500 focus:outline-none"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          value={status}
          onChange={(e) => applyFilters({ status: e.target.value })}
        >
          <option value="">Todos os status</option>
          <option value="online">Online</option>
          <option value="maintenance">Manutenção</option>
          <option value="offline">Offline</option>
          <option value="archived">Arquivadas</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="px-4 py-3 font-medium text-gray-600">Categoria</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Último Check</th>
              <th className="px-4 py-3 font-medium text-gray-600">Usuários</th>
              <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{app.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {app.categoryName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${statusColors[app.status] ?? 'bg-gray-400'}`}
                    />
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{timeAgo(app.lastHealthCheck)}</td>
                <td className="px-4 py-3 text-gray-500">{app.userCount.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/aplicacoes/${app.slug}/editar`}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-teal-600"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {app.status !== 'archived' && confirmingArchive !== app.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmingArchive(app.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600"
                        title="Arquivar"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    {confirmingArchive === app.id && (
                      <span className="flex items-center gap-1">
                        <span className="text-xs text-amber-600">Arquivar?</span>
                        <button
                          type="button"
                          onClick={() => confirmArchive(app.id)}
                          disabled={isPending}
                          className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-50"
                          title="Confirmar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingArchive(null)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma aplicação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() => {
                const params = new URLSearchParams();
                if (searchValue) params.set('search', searchValue);
                if (status) params.set('status', status);
                params.set('page', String(page - 1));
                startTransition(() => router.push(`/admin/aplicacoes?${params.toString()}`));
              }}
              className="rounded-lg border border-gray-200 px-3 py-1 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isPending}
              onClick={() => {
                const params = new URLSearchParams();
                if (searchValue) params.set('search', searchValue);
                if (status) params.set('status', status);
                params.set('page', String(page + 1));
                startTransition(() => router.push(`/admin/aplicacoes?${params.toString()}`));
              }}
              className="rounded-lg border border-gray-200 px-3 py-1 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
