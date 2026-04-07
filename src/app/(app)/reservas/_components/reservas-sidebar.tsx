'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Building2,
  Monitor,
  Users,
  Calendar,
  DoorOpen,
  Plus,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const userGroups: NavGroup[] = [
  {
    title: 'Minhas Reservas',
    items: [
      { label: 'Minhas Estações', href: '/reservas/minhas-estacoes', icon: Monitor },
      { label: 'Minhas Salas', href: '/reservas/minhas-salas', icon: DoorOpen },
      { label: 'Nova Reserva de Estação', href: '/reservas/nova-reserva/estacao', icon: Plus },
      { label: 'Nova Reserva de Sala', href: '/reservas/nova-reserva/sala', icon: CalendarCheck },
    ],
  },
];

const adminGroup: NavGroup = {
  title: 'Administração',
  items: [
    { label: 'Escritórios', href: '/reservas/admin/escritorios', icon: Building2 },
    { label: 'Salas', href: '/reservas/admin/salas', icon: DoorOpen },
    { label: 'Estações', href: '/reservas/admin/estacoes', icon: Monitor },
    { label: 'Feriados', href: '/reservas/admin/feriados', icon: Calendar },
  ],
};

function isAdmin(roles: string[]) {
  return roles.includes('reservas:admin') || roles.includes('admin');
}

export function ReservasSidebar({ userRoles }: { userRoles: string[] }) {
  const pathname = usePathname();

  const groups = isAdmin(userRoles) ? [...userGroups, adminGroup] : userGroups;

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100%',
        borderRight: '1px solid #E2E8F0',
        background: '#FFFFFF',
        padding: '16px 0',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 16px 12px', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={20} style={{ color: '#0D9488' }} />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1E293B',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Reservas
          </span>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.title} style={{ marginBottom: 16 }}>
          <div
            style={{
              padding: '0 16px',
              marginBottom: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {group.title}
          </div>
          <nav>
            {group.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    margin: '2px 8px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: active ? 500 : 400,
                    color: active ? '#FFFFFF' : '#334155',
                    background: active ? '#0D9488' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = '#F0FDFA';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
