export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
  roles?: string[];
}

export interface NavDivider {
  type: 'divider';
}

export type SidebarItem = NavItem | NavDivider;

export function isDivider(item: SidebarItem): item is NavDivider {
  return 'type' in item && item.type === 'divider';
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

/** Top nav pills — portal mode navigation */
export const portalNavItems: NavItem[] = [
  { label: 'Início', href: '/inicio', icon: 'Home' },
  { label: 'Aplicações', href: '/aplicacoes', icon: 'Grid3X3' },
  { label: 'CatIA', href: '/catia', icon: 'MessageSquare' },
  { label: 'Favoritos', href: '/aplicacoes?filtro=favoritos', icon: 'Star' },
];

/** Routes that use portal mode (no sidebar, top nav with pills) */
export const portalRoutes = [
  '/inicio',
  '/aplicacoes',
  '/catia',
  '/favoritos',
  '/suporte',
  '/ajuda',
];

/** Check if a pathname is in portal mode */
export function isPortalMode(pathname: string): boolean {
  if (pathname === '/') return true;
  return portalRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

/** Sidebar navigation — secondary navigation */
export const sidebarNavItems: SidebarItem[] = [
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
  { type: 'divider' },
  {
    label: 'Ajuda',
    href: '/ajuda',
    icon: 'BookOpen',
    roles: ['user', 'admin', 'viewer'],
  },
];

/** Mobile bottom nav items */
export const mobileNavItems: NavItem[] = [
  { label: 'Inicio', href: '/inicio', icon: 'Home' },
  { label: 'Favoritos', href: '/aplicacoes?filtro=favoritos', icon: 'Star' },
  { label: 'Ajuda', href: '/ajuda', icon: 'BookOpen' },
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
  ajuda: 'Ajuda',
  usuario: 'Guia do Usuario',
  reservas: 'Reservas',
  'minhas-estacoes': 'Minhas Estações',
  'minhas-salas': 'Minhas Salas',
  'nova-reserva-estacao': 'Nova Reserva de Estação',
  'nova-reserva-sala': 'Nova Reserva de Sala',
  escritorios: 'Escritórios',
  salas: 'Salas',
  estacoes: 'Estações',
  feriados: 'Feriados',
};

/** View modes for the header toggle */
export type ViewMode = 'aplicacoes' | 'catia';
