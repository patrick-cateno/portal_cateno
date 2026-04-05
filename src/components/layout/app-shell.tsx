'use client';

import { LayoutProvider, useLayout } from '@/hooks/use-layout';
import { cn } from '@/lib/utils';
import { SkipLink } from './skip-link';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { MobileDrawer } from './mobile-drawer';

interface AppShellProps {
  children: React.ReactNode;
  userRoles?: string[];
}

function AppShellInner({ children, userRoles }: AppShellProps) {
  const { sidebarCollapsed } = useLayout();

  return (
    <div className="flex h-screen flex-col">
      <SkipLink />
      <Header />

      <div className="flex flex-1 pt-[var(--header-height)]">
        <Sidebar userRoles={userRoles} />

        <main
          id="main-content"
          className={cn(
            'relative z-0 flex-1 overflow-y-auto transition-[margin-left] duration-150 ease-out',
            'pb-16 md:pb-0', // space for mobile bottom nav
            sidebarCollapsed ? 'md:ml-[var(--sidebar-collapsed)]' : 'md:ml-[var(--sidebar-width)]',
          )}
        >
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>

      <MobileNav />
      <MobileDrawer userRoles={userRoles} />
    </div>
  );
}

export function AppShell({ children, userRoles }: AppShellProps) {
  return (
    <LayoutProvider>
      <AppShellInner userRoles={userRoles}>{children}</AppShellInner>
    </LayoutProvider>
  );
}
