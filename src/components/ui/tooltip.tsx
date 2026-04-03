'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

function Tooltip({ content, side = 'top', children, className }: TooltipProps) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-md',
          'opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100',
          positionClasses[side],
        )}
      >
        {content}
      </span>
    </div>
  );
}

export { Tooltip };
