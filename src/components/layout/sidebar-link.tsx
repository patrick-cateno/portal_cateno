'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui';
import type { NavItem } from '@/config/navigation';

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarLink({ item, collapsed }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0]);

  // Dynamically resolve lucide icon
  const Icon =
    (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[item.icon] ??
    LucideIcons.Circle;

  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150',
        isActive
          ? 'border-primary-600 bg-primary-50 text-primary-700 border-l-[3px] font-semibold'
          : 'border-l-[3px] border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon
        className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary-600' : 'text-neutral-500')}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip content={item.label} side="right">
        {link}
      </Tooltip>
    );
  }

  return link;
}
