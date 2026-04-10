'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, HelpCircle } from 'lucide-react';
import { CatenoLogo } from '@/components/ui';
import { useLayout } from '@/hooks/use-layout';
import { portalNavItems, isPortalMode } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Breadcrumb } from './breadcrumb';
import { SearchTrigger } from './search-trigger';
import { NotificationBell } from './notification-bell';
import { UserDropdown } from './user-dropdown';

export function TopNavBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { openMobileDrawer } = useLayout();
  const isPortal = isPortalMode(pathname);

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-[var(--header-height)] w-full items-center bg-white/80 px-4 backdrop-blur-xl',
        'border-b border-neutral-200/60',
        className,
      )}
    >
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobileDrawer}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/inicio"
          title="CSA - CatIA Super App"
          className="flex shrink-0 items-center gap-2"
        >
          <CatenoLogo size="sm" variant="dark" />
          <span className="hidden text-sm font-semibold text-neutral-800 md:inline">CSA</span>
        </Link>
      </div>

      {/* Center: nav pills (portal) or breadcrumb (micro) */}
      <div className="flex flex-1 items-center justify-center">
        {isPortal ? (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {portalNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/inicio' && pathname.startsWith(item.href.split('?')[0]));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <Breadcrumb className="flex-1" />
        )}
      </div>

      {/* Right: help, search, notifications, user */}
      <div className="flex items-center gap-1">
        <Link
          href="/ajuda"
          className={cn(
            'hidden rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 md:flex',
            pathname.startsWith('/ajuda') && 'bg-neutral-100 text-neutral-900',
          )}
          title="Ajuda e Suporte"
        >
          <HelpCircle className="h-5 w-5" />
        </Link>
        <SearchTrigger />
        <NotificationBell />
        <UserDropdown />
      </div>
    </header>
  );
}
