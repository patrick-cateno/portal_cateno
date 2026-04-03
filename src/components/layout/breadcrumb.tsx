'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { breadcrumbLabels } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/');
      const label = breadcrumbLabels[segment] ?? segment;
      const isLast = index === arr.length - 1;
      return { href, label, isLast };
    });

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('hidden md:flex', className)}>
      <ol className="flex items-center gap-1 text-xs">
        <li>
          <Link href="/inicio" className="text-neutral-500 hover:text-neutral-700">
            Home
          </Link>
        </li>
        {segments.map((segment) => (
          <li key={segment.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-neutral-300" />
            {segment.isLast ? (
              <span className="font-medium text-neutral-900" aria-current="page">
                {segment.label}
              </span>
            ) : (
              <Link href={segment.href} className="text-neutral-500 hover:text-neutral-700">
                {segment.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
