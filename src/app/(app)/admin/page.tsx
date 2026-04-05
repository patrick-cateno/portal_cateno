import { prisma } from '@/lib/db';
import { LayoutDashboard, AppWindow, FolderOpen, Shield, Activity } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const [appCount, categoryCount, onlineCount, maintenanceCount] = await Promise.all([
    prisma.application.count({ where: { status: { not: 'archived' } } }),
    prisma.category.count(),
    prisma.application.count({ where: { status: 'online' } }),
    prisma.application.count({ where: { status: 'maintenance' } }),
  ]);

  const cards = [
    {
      title: 'Aplicações',
      value: appCount,
      icon: AppWindow,
      href: '/admin/aplicacoes',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Categorias',
      value: categoryCount,
      icon: FolderOpen,
      href: '/admin/categorias',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Online',
      value: onlineCount,
      icon: Activity,
      href: '/admin/aplicacoes?status=online',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Manutenção',
      value: maintenanceCount,
      icon: Shield,
      href: '/admin/aplicacoes?status=maintenance',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Painel Administrativo</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`rounded-lg ${card.bg} p-3`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
