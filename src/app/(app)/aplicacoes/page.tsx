import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AplicacoesView } from '@/components/features/applications';
import type { ApplicationCard, CategoryItem } from '@/types';
import type { ApplicationStatus } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aplicações',
};

export default async function AplicacoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Fetch user roles for RBAC
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });

  const userRoles = user?.roles.map((r) => r.name) ?? [];
  const isAdmin = userRoles.includes('admin');
  const isUser = userRoles.includes('user');
  const isViewer = userRoles.includes('viewer');

  // RBAC: build where clause
  const whereClause =
    isAdmin || isUser
      ? {}
      : isViewer
        ? { category: { slug: { in: ['financeiro', 'analytics'] } } }
        : { id: 'none' }; // no role = no apps

  // Parallel queries
  const [apps, favorites, categories] = await Promise.all([
    prisma.application.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { name: 'asc' },
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { applicationId: true },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  // Map to client-safe types
  const mappedApps: ApplicationCard[] = apps.map((app) => ({
    id: app.id,
    name: app.name,
    slug: app.slug,
    description: app.description,
    icon: app.icon,
    categoryId: app.categoryId,
    categoryName: app.category.name,
    categorySlug: app.category.slug,
    status: app.status as ApplicationStatus,
    url: app.url,
    userCount: app.userCount,
    trend: app.trend,
  }));

  const mappedCategories: CategoryItem[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    order: cat.order,
  }));

  const favoriteIds = favorites.map((f) => f.applicationId);

  return (
    <AplicacoesView
      initialApps={mappedApps}
      initialCategories={mappedCategories}
      initialFavoriteIds={favoriteIds}
    />
  );
}
