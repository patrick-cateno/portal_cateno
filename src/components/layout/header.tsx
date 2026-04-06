'use client';

import Link from 'next/link';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { CatenoLogo } from '@/components/ui';
import { useLayout } from '@/hooks/use-layout';
import { cn } from '@/lib/utils';
import { Breadcrumb } from './breadcrumb';
import { ViewToggle } from './view-toggle';
import { SearchTrigger } from './search-trigger';
import { NotificationBell } from './notification-bell';
import { UserDropdown } from './user-dropdown';

export function Header({ className }: { className?: string }) {
  const { sidebarCollapsed, toggleSidebar, openMobileDrawer } = useLayout();

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-[var(--header-height)] w-full items-center border-b border-neutral-200 bg-white px-4 shadow-sm',
        className,
      )}
    >
      {/* Left: hamburger (mobile) + sidebar toggle (desktop) + logo */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={openMobileDrawer}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:flex"
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {/* Logo */}
        <Link href="/aplicacoes" title="CSA" className="shrink-0">
          <CatenoLogo size="sm" variant="dark" />
        </Link>
      </div>

      {/* Center: breadcrumb + view toggle */}
      <div className="flex flex-1 items-center justify-center gap-4">
        <Breadcrumb className="flex-1" />
        <ViewToggle />
      </div>

      {/* Right: search, notifications, user */}
      <div className="flex items-center gap-1">
        <SearchTrigger />
        <NotificationBell />
        <UserDropdown />
      </div>
    </header>
  );
}
