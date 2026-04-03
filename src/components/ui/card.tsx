import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-sm bg-surface-raised text-foreground', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    border: {
      none: '',
      default: 'border border-border',
      subtle: 'border border-border-subtle',
    },
    shadow: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      card: 'shadow-card',
    },
  },
  defaultVariants: {
    padding: 'md',
    border: 'default',
    shadow: 'sm',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, border, shadow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ padding, border, shadow }), className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-foreground text-lg leading-relaxed font-semibold', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-neutral-500', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mt-4', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 flex items-center', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
