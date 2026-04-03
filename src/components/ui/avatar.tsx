'use client';

import * as React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string | null;
  name?: string | null;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, size, className, ...props }, ref) => {
    const initials = name ? getInitials(name) : '?';

    const sizeMap = { sm: 32, md: 36, lg: 40 };
    const px = sizeMap[size ?? 'md'];

    if (src) {
      return (
        <div
          ref={ref}
          className={cn(avatarVariants({ size }), 'relative overflow-hidden', className)}
          {...props}
        >
          <Image src={src} alt={name ?? 'Avatar'} width={px} height={px} className="object-cover" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), 'bg-primary-600 text-white', className)}
        aria-label={name ?? 'Avatar'}
        {...props}
      >
        {initials}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };
