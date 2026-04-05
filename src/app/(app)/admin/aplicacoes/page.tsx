import { prisma } from '@/lib/db';
import { AppWindow, Plus } from 'lucide-react';
import Link from 'next/link';
import { AdminAppTable } from '@/components/features/admin/admin-app-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aplicações — Admin',
};

export default async function AdminAplicacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? '';
  const status = params.status ?? '';
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 10;

  const where = {
    ...(status && { status: status as 'online' | 'maintenance' | 'offline' | 'archived' }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        category: true,
        health: { orderBy: { checkedAt: 'desc' }, take: 1 },
      },
      orderBy: { order: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.application.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppWindow className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Aplicações</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
            {total}
          </span>
        </div>
        <Link
          href="/admin/aplicacoes/nova"
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Nova Aplicação
        </Link>
      </div>

      <AdminAppTable
        applications={applications.map((app) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
          icon: app.icon,
          status: app.status,
          categoryName: app.category.name,
          userCount: app.userCount,
          lastHealthCheck: app.health[0]?.checkedAt?.toISOString() ?? null,
        }))}
        search={search}
        status={status}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
