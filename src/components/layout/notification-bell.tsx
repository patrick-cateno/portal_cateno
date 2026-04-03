'use client';

import { Bell } from 'lucide-react';
import { Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  count?: number;
  className?: string;
}

export function NotificationBell({ count = 0, className }: NotificationBellProps) {
  return (
    <Tooltip content="Notificacoes" side="bottom">
      <button
        type="button"
        className={cn(
          'relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
          className,
        )}
        aria-label={`Notificacoes${count > 0 ? ` (${count} novas)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
