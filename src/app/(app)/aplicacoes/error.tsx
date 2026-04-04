'use client';

import { AlertTriangle } from 'lucide-react';

export default function AplicacoesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-16 w-16 text-red-500" />
      <h2 className="mt-4 text-lg font-semibold text-neutral-900">Erro ao carregar aplicações</h2>
      <p className="mt-1 text-sm text-neutral-600">Ocorreu um erro inesperado. Tente novamente.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
