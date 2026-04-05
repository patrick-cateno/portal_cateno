import { prisma } from '@/lib/db';
import { FolderOpen } from 'lucide-react';
import { CategoriesManager } from '@/components/features/admin/categories-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categorias — Admin',
};

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Categorias</h1>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
          {categories.length}
        </span>
      </div>

      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          order: c.order,
          appCount: c._count.applications,
        }))}
      />
    </div>
  );
}
