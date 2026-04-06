'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Grid3X3,
  MessageSquare,
  HelpCircle,
  AppWindow,
  LayoutList,
  Shield,
  Wrench,
  Activity,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarSection {
  title: string;
  basePath: string;
  items: { label: string; hash: string; icon: LucideIcon }[];
}

const usuarioSections: SidebarSection = {
  title: 'Guia do Usuario',
  basePath: '/ajuda/usuario',
  items: [
    { label: 'Primeiros Passos', hash: 'primeiros-passos', icon: BookOpen },
    { label: 'Catalogo de Aplicacoes', hash: 'catalogo', icon: Grid3X3 },
    { label: 'CatIA — Assistente', hash: 'catia', icon: MessageSquare },
    { label: 'FAQ', hash: 'faq', icon: HelpCircle },
  ],
};

const adminSections: SidebarSection = {
  title: 'Guia do Administrador',
  basePath: '/ajuda/admin',
  items: [
    { label: 'Gestao de Aplicacoes', hash: 'aplicacoes', icon: AppWindow },
    { label: 'Gestao de Categorias', hash: 'categorias', icon: LayoutList },
    { label: 'Gestao de Permissoes', hash: 'permissoes', icon: Shield },
    { label: 'Tool Registry', hash: 'tool-registry', icon: Wrench },
    { label: 'Monitoramento', hash: 'monitoramento', icon: Activity },
    { label: 'Configuracao', hash: 'configuracao', icon: Settings },
  ],
};

interface DocsSidebarProps {
  isAdmin: boolean;
}

export function DocsSidebar({ isAdmin }: DocsSidebarProps) {
  const pathname = usePathname();
  const isUsuarioPage = pathname.startsWith('/ajuda/usuario');
  const isAdminPage = pathname.startsWith('/ajuda/admin');

  const activeSection = isAdminPage ? adminSections : usuarioSections;

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-6 space-y-1">
        <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          {activeSection.title}
        </p>
        {activeSection.items.map((item) => {
          const href = `${activeSection.basePath}#${item.hash}`;
          const Icon = item.icon;
          return (
            <Link
              key={item.hash}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {isAdmin && isUsuarioPage && (
          <>
            <div className="my-3 h-px bg-neutral-200" role="separator" />
            <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Administrador
            </p>
            {adminSections.items.slice(0, 3).map((item) => {
              const href = `/ajuda/admin#${item.hash}`;
              const Icon = item.icon;
              return (
                <Link
                  key={item.hash}
                  href={href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
