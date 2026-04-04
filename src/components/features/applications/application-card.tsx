'use client';

import {
  Star,
  ArrowUpRight,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Server,
  PlusCircle,
  AlertTriangle,
  FileText,
  Landmark,
  Activity,
  UserCheck,
  FileBarChart,
  Globe,
  Monitor,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import type { ApplicationCard as ApplicationCardType, ApplicationStatus } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  CreditCard,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Server,
  PlusCircle,
  AlertTriangle,
  FileText,
  Landmark,
  Activity,
  UserCheck,
  FileBarChart,
  Globe,
  Monitor,
};

const statusLabel: Record<ApplicationStatus, string> = {
  online: 'Online',
  maintenance: 'Manutenção',
  offline: 'Offline',
};

function formatUserCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return count.toString();
}

interface Props {
  app: ApplicationCardType;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function ApplicationCard({ app, isFavorited, onToggleFavorite }: Props) {
  const Icon = app.icon ? iconMap[app.icon] : null;

  return (
    <article
      role="article"
      tabIndex={0}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-150 hover:border-teal-300 hover:shadow-md focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:outline-none"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Navigate to app detail (future)
        }
      }}
    >
      {/* Accent bar on hover */}
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-teal-600 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

      {/* Header: icon + title + star */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
          {Icon ? (
            <Icon className="h-5 w-5 text-teal-600" />
          ) : (
            <span className="text-sm font-semibold text-teal-600">
              {app.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base leading-tight font-semibold text-neutral-900">{app.name}</h3>
          <span className="text-xs text-teal-600">{app.categoryName}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="shrink-0 p-1 transition-colors hover:text-teal-600"
          aria-label={isFavorited ? `Remover ${app.name} dos favoritos` : `Favoritar ${app.name}`}
        >
          <Star
            className={`h-5 w-5 ${isFavorited ? 'fill-teal-600 text-teal-600' : 'text-neutral-400'}`}
          />
        </button>
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{app.description}</p>

      {/* Footer: status + users + trend */}
      <div className="mt-auto flex items-center gap-3 pt-4">
        <Badge variant={app.status} size="sm" dot>
          {statusLabel[app.status]}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Users className="h-3.5 w-3.5" />
          {formatUserCount(app.userCount)}
        </span>
        <TrendIndicator value={app.trend} />
      </div>

      {/* Hover CTA */}
      <div className="mt-3 flex justify-end opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <span className="flex items-center gap-1 text-sm font-medium text-teal-600">
          Abrir <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-green-600">
        <TrendingUp className="h-3.5 w-3.5" />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-red-600">
        <TrendingDown className="h-3.5 w-3.5" />
        {value}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-xs text-neutral-500">
      <Minus className="h-3.5 w-3.5" />
      0%
    </span>
  );
}
