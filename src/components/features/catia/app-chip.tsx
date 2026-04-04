'use client';

import { useRouter } from 'next/navigation';

interface Props {
  slug: string;
  name: string;
}

export function AppChip({ slug, name }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/aplicacoes?search=${encodeURIComponent(name)}`)}
      className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
      aria-label={`Abrir ${name}`}
    >
      🎫 {name}
    </button>
  );
}
