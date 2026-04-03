'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid3X3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const views = [
  { label: 'Aplicacoes', href: '/aplicacoes', icon: Grid3X3 },
  { label: 'CatIA', href: '/catia', icon: MessageSquare },
] as const;

export function ViewToggle({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'hidden items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 md:flex',
        className,
      )}
    >
      {views.map(({ label, href, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
