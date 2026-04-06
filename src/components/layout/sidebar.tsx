'use client';

import { sidebarNavItems, isDivider } from '@/config/navigation';
import { useLayout } from '@/hooks/use-layout';
import { cn } from '@/lib/utils';
import { SidebarLink } from './sidebar-link';

interface SidebarProps {
  userRoles?: string[];
  className?: string;
}

export function Sidebar({ userRoles = ['user'], className }: SidebarProps) {
  const { sidebarCollapsed } = useLayout();

  return (
    <aside
      aria-label="Navegacao principal"
      className={cn(
        'fixed top-[var(--header-height)] left-0 z-20 hidden h-[calc(100vh-var(--header-height))] border-r border-neutral-200 bg-white transition-[width] duration-150 ease-out md:block',
        sidebarCollapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]',
        className,
      )}
    >
      <nav className={cn('flex flex-col gap-1 p-3', sidebarCollapsed && 'items-center px-2')}>
        {sidebarNavItems.map((item, index) => {
          if (isDivider(item)) {
            return (
              <div key={`divider-${index}`} className="my-1 h-px bg-neutral-200" role="separator" />
            );
          }

          if (item.roles && !item.roles.some((role) => userRoles.includes(role))) {
            return null;
          }

          return <SidebarLink key={item.href} item={item} collapsed={sidebarCollapsed} />;
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'absolute right-0 bottom-0 left-0 border-t border-neutral-100 p-3',
          sidebarCollapsed && 'text-center',
        )}
      >
        <span className="text-[10px] text-neutral-400">
          {sidebarCollapsed ? 'v1' : 'v1.0.0-beta'}
        </span>
      </div>
    </aside>
  );
}
