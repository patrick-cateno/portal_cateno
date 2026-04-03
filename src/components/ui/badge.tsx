import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium leading-none',
  {
    variants: {
      variant: {
        online: 'bg-lime-50 text-lime-600 border border-lime-200',
        maintenance: 'bg-amber-50 text-amber-600 border border-amber-200',
        offline: 'bg-red-50 text-red-600 border border-red-200',
        primary: 'bg-primary-50 text-primary-700 border border-primary-200',
        neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
        info: 'bg-sky-50 text-sky-700 border border-sky-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      dot: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
      dot: false,
    },
  },
);

const dotColorMap: Record<string, string> = {
  online: 'bg-lime-500',
  maintenance: 'bg-amber-500',
  offline: 'bg-red-500',
  primary: 'bg-primary-600',
  neutral: 'bg-neutral-400',
  info: 'bg-sky-500',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = 'neutral', size, dot, children, ...props }: BadgeProps) {
  const dotClass = dotColorMap[variant ?? 'neutral'] ?? 'bg-neutral-400';

  return (
    <span className={cn(badgeVariants({ variant, size, dot }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full',
            dotClass,
            size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
