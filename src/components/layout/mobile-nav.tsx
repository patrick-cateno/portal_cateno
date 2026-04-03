'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { mobileNavItems } from '@/config/navigation';
import { useLayout } from '@/hooks/use-layout';
import { cn } from '@/lib/utils';

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { openMobileDrawer } = useLayout();

  return (
    <nav
      aria-label="Navegacao mobile"
      className={cn(
        'fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-neutral-200 bg-white py-2 md:hidden',
        className,
      )}
    >
      {mobileNavItems.map((item) => {
        const Icon =
          (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[item.icon] ??
          LucideIcons.Circle;
        const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0]);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1',
              isActive ? 'text-primary-600' : 'text-neutral-500',
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu button for drawer */}
      <button
        type="button"
        onClick={openMobileDrawer}
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-neutral-500"
      >
        <LucideIcons.Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </nav>
  );
}
