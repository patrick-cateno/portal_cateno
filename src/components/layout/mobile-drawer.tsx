'use client';

import { X } from 'lucide-react';
import { sidebarNavItems, isDivider } from '@/config/navigation';
import { useLayout } from '@/hooks/use-layout';
import { cn } from '@/lib/utils';
import { SidebarLink } from './sidebar-link';

interface MobileDrawerProps {
  userRoles?: string[];
}

export function MobileDrawer({ userRoles = ['user'] }: MobileDrawerProps) {
  const { sidebarOpen, closeMobileDrawer } = useLayout();

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobileDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        aria-label="Menu de navegacao"
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[280px] bg-white shadow-xl transition-transform duration-200 ease-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <span className="text-sm font-semibold text-neutral-900">Menu</span>
          <button
            type="button"
            onClick={closeMobileDrawer}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {sidebarNavItems.map((item, index) => {
            if (isDivider(item)) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 h-px bg-neutral-200"
                  role="separator"
                />
              );
            }

            if (item.roles && !item.roles.some((role) => userRoles.includes(role))) {
              return null;
            }

            return (
              <div key={item.href} onClick={closeMobileDrawer}>
                <SidebarLink item={item} collapsed={false} />
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
