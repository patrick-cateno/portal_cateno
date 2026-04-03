// ═══════════════════════════════════════════
// Portal Cateno — Shared Types
// ═══════════════════════════════════════════

export type ApplicationStatus = 'online' | 'maintenance' | 'offline';

export interface ApplicationCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  categoryId: string;
  status: ApplicationStatus;
  url: string | null;
  userCount: number;
  trend: number;
  isFavorite: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
}
