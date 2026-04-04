'use client';

import { SearchX } from 'lucide-react';

interface Props {
  onReset: () => void;
}

export function EmptyState({ onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="h-16 w-16 text-neutral-300" />
      <h2 className="mt-4 text-lg font-semibold text-neutral-900">Nenhum resultado</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Tente ajustar os filtros ou a busca para encontrar aplicações.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        Limpar filtros
      </button>
    </div>
  );
}
