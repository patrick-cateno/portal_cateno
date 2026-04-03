export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Visão geral do portal',
  },
  {
    label: 'Aplicações',
    href: '/aplicacoes',
    icon: 'Grid3X3',
    description: 'Todas as aplicações Cateno',
  },
  {
    label: 'CatIA',
    href: '/catia',
    icon: 'MessageSquare',
    description: 'Assistente inteligente Cateno',
  },
];
