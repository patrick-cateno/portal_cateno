'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

const sizeMap = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'h-3 w-3',
    translate: 'translate-x-4',
    label: 'text-xs',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
    label: 'text-sm',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'h-6 w-6',
    translate: 'translate-x-7',
    label: 'text-base',
  },
};

function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className,
  id,
}: ToggleProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const generatedId = React.useId();
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : internalChecked;
  const { track, thumb, translate, label: labelSize } = sizeMap[size];
  const toggleId = id ?? `toggle-${generatedId}`;

  function handleClick() {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        role="switch"
        id={toggleId}
        aria-checked={isOn}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:ring-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isOn ? 'bg-primary-600' : 'bg-neutral-200',
          track,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm',
            'transform transition duration-200 ease-in-out',
            'translate-x-0',
            isOn && translate,
            thumb,
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={toggleId}
          className={cn(
            'cursor-pointer text-neutral-700 select-none',
            labelSize,
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export { Toggle };
