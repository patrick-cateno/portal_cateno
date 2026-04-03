'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  indeterminate?: boolean;
}

const sizeMap = {
  sm: { box: 'h-3.5 w-3.5', label: 'text-xs', icon: 10 },
  md: { box: 'h-4 w-4', label: 'text-sm', icon: 12 },
  lg: { box: 'h-5 w-5', label: 'text-base', icon: 14 },
};

function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  helperText,
  size = 'md',
  className,
  id,
  indeterminate = false,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const generatedId = React.useId();
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  const { box, label: labelSize, icon: iconSize } = sizeMap[size];
  const checkboxId = id ?? `checkbox-${generatedId}`;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    const next = e.target.checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-start gap-2">
        <span className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            id={checkboxId}
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate;
            }}
            className="sr-only"
            aria-label={label}
          />
          <span
            aria-hidden="true"
            className={cn(
              'flex items-center justify-center rounded-xs border-2 transition-colors duration-150',
              box,
              isChecked || indeterminate
                ? 'bg-primary-600 border-primary-600'
                : 'border-neutral-300 bg-white',
              disabled && 'cursor-not-allowed opacity-50',
              !disabled && !isChecked && !indeterminate && 'hover:border-primary-400',
            )}
          >
            {indeterminate && !isChecked ? (
              /* Minus / indeterminate icon */
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 6H10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : isChecked ? (
              /* Checkmark icon */
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6L4.5 8.5L10 3.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
        </span>
        {label && (
          <span
            className={cn(
              'text-neutral-700 select-none',
              labelSize,
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {label}
          </span>
        )}
      </label>
      {helperText && <p className={cn('ml-6 text-xs text-neutral-500')}>{helperText}</p>}
    </div>
  );
}

export { Checkbox };
