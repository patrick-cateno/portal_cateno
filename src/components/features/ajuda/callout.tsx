import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutVariant = 'info' | 'warning' | 'tip';

const variants: Record<
  CalloutVariant,
  { icon: typeof Info; bg: string; border: string; text: string }
> = {
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-800',
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', v.bg, v.border)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', v.text)} />
      <div>
        {title && <p className={cn('mb-1 text-sm font-semibold', v.text)}>{title}</p>}
        <div className={cn('text-sm', v.text)}>{children}</div>
      </div>
    </div>
  );
}
