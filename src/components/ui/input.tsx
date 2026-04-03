import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-11 px-4 text-base',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, label, helperText, size = 'md', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xs border bg-white text-neutral-900 placeholder:text-neutral-400',
            'transition-colors duration-150',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50',
            error
              ? 'border-error focus:border-error focus:ring-error/30'
              : 'focus:border-primary-600 focus:ring-primary-600/20 border-neutral-200',
            sizeClasses[size],
            className,
          )}
          aria-invalid={error}
          {...props}
        />
        {helperText && (
          <p className={cn('text-xs', error ? 'text-error' : 'text-neutral-500')}>{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
