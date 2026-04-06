'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DocsSidebar } from './docs-sidebar';

interface AjudaShellProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

export function AjudaShell({ isAdmin, children }: AjudaShellProps) {
  const pathname = usePathname();
  const isUsuario = pathname.startsWith('/ajuda/usuario');
  const isAdminTab = pathname.startsWith('/ajuda/admin');

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Central de Ajuda</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Encontre respostas e guias de utilizacao do CatIA Super App
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-neutral-200">
        <Link
          href="/ajuda/usuario"
          className={cn(
            'relative px-4 py-2 text-sm font-medium transition-colors duration-150',
            isUsuario
              ? 'text-primary-600 after:bg-primary-600 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5'
              : 'text-neutral-500 hover:text-neutral-700',
          )}
        >
          Guia do Usuario
        </Link>
        {isAdmin && (
          <Link
            href="/ajuda/admin"
            className={cn(
              'relative px-4 py-2 text-sm font-medium transition-colors duration-150',
              isAdminTab
                ? 'text-primary-600 after:bg-primary-600 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            Guia do Administrador
          </Link>
        )}
      </div>

      <div className="flex gap-8">
        {/* Internal docs sidebar */}
        <DocsSidebar isAdmin={isAdmin} />

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
