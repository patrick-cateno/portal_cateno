import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap font-medium',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary-600',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700 active:bg-primary-800',
          'rounded-sm',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900 border border-neutral-200',
          'hover:bg-neutral-200 active:bg-neutral-300',
          'rounded-sm',
        ],
        ghost: [
          'text-neutral-700',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'active:bg-neutral-200',
          'rounded-sm',
        ],
        destructive: ['bg-red-600 text-white', 'hover:bg-red-700 active:bg-red-800', 'rounded-sm'],
        outline: [
          'border border-primary-200 text-primary-600 bg-transparent',
          'hover:bg-primary-50 active:bg-primary-100',
          'rounded-sm',
        ],
        link: ['text-primary-600 underline-offset-4 hover:underline', 'p-0 h-auto'],
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-11 px-6 text-base gap-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
