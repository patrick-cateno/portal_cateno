export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
  roles?: string[];
}

/** Header navigation — main views accessed via View Toggle */
export const mainNavItems: NavItem[] = [
  {
    label: 'Aplicacoes',
    href: '/aplicacoes',
    icon: 'Grid3X3',
    description: 'Todas as aplicacoes Cateno',
  },
  {
    label: 'CatIA',
    href: '/catia',
    icon: 'MessageSquare',
    description: 'Assistente inteligente Cateno',
  },
];

/** Sidebar navigation — secondary navigation */
export const sidebarNavItems: NavItem[] = [
  {
    label: 'Inicio',
    href: '/inicio',
    icon: 'Home',
    roles: ['user', 'admin', 'viewer'],
  },
  {
    label: 'Favoritos',
    href: '/aplicacoes?filtro=favoritos',
    icon: 'Star',
    roles: ['user', 'admin'],
  },
  {
    label: 'Suporte',
    href: '/suporte',
    icon: 'HelpCircle',
    roles: ['user', 'admin', 'viewer'],
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: 'Settings',
    roles: ['admin'],
  },
];

/** Mobile bottom nav items */
export const mobileNavItems: NavItem[] = [
  { label: 'Inicio', href: '/inicio', icon: 'Home' },
  { label: 'Favoritos', href: '/aplicacoes?filtro=favoritos', icon: 'Star' },
  { label: 'Suporte', href: '/suporte', icon: 'HelpCircle' },
];

/** Breadcrumb label map: pathname segment → display label */
export const breadcrumbLabels: Record<string, string> = {
  inicio: 'Inicio',
  aplicacoes: 'Aplicacoes',
  catia: 'CatIA',
  suporte: 'Suporte',
  admin: 'Admin',
  dashboard: 'Dashboard',
  favoritos: 'Favoritos',
};

/** View modes for the header toggle */
export type ViewMode = 'aplicacoes' | 'catia';
