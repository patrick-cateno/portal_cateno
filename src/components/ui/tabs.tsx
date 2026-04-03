'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue: string;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

function Tabs({ items, value, defaultValue, onValueChange, className, size = 'md' }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? items[0]?.value ?? '');
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  function handleSelect(tabValue: string) {
    if (!isControlled) setInternalValue(tabValue);
    onValueChange?.(tabValue);
  }

  return (
    <div role="tablist" aria-label="Tabs" className={cn('border-border flex border-b', className)}>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={isActive}
            aria-disabled={item.disabled}
            disabled={item.disabled}
            onClick={() => !item.disabled && handleSelect(item.value)}
            className={cn(
              'relative font-medium whitespace-nowrap transition-colors duration-150',
              'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[size],
              isActive
                ? 'text-primary-600 after:bg-primary-600 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function TabsContent({ value, activeValue, className, children, ...props }: TabsContentProps) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsContent };
