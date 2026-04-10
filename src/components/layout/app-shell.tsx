'use client';

import { usePathname } from 'next/navigation';
import { LayoutProvider, useLayout } from '@/hooks/use-layout';
import { isPortalMode } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { SkipLink } from './skip-link';
import { TopNavBar } from './top-nav-bar';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { MobileDrawer } from './mobile-drawer';

interface AppShellProps {
  children: React.ReactNode;
  userRoles?: string[];
}

function AppShellInner({ children, userRoles }: AppShellProps) {
  const { sidebarCollapsed } = useLayout();
  const pathname = usePathname();
  const isPortal = isPortalMode(pathname);

  return (
    <div className="flex h-screen flex-col">
      <SkipLink />
      <TopNavBar />

      <div className="flex flex-1 pt-[var(--header-height)]">
        {!isPortal && <Sidebar userRoles={userRoles} />}

        <main
          id="main-content"
          className={cn(
            'relative z-0 flex-1 overflow-y-auto transition-[margin-left] duration-150 ease-out',
            'pb-16 md:pb-0',
            isPortal
              ? 'md:ml-0'
              : sidebarCollapsed
                ? 'md:ml-[var(--sidebar-collapsed)]'
                : 'md:ml-[var(--sidebar-width)]',
          )}
        >
          <div className={cn('mx-auto p-6', isPortal ? 'max-w-6xl' : 'max-w-7xl')}>{children}</div>
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
