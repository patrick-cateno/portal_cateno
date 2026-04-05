import { prisma } from '@/lib/db';
import { Shield } from 'lucide-react';
import { PermissionsTable } from '@/components/features/admin/permissions-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Permissões — Admin',
};

export default async function AdminPermissoesPage() {
  const [viewers, applications, permissions] = await Promise.all([
    prisma.user.findMany({
      where: { roles: { some: { name: 'viewer' } } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.application.findMany({
      where: { status: { not: 'archived' } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.permission.findMany({
      select: { userId: true, applicationId: true, canView: true, canExecute: true },
    }),
  ]);

  const permissionMap: Record<string, { canView: boolean; canExecute: boolean }> = {};
  for (const p of permissions) {
    permissionMap[`${p.userId}:${p.applicationId}`] = {
      canView: p.canView,
      canExecute: p.canExecute,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Permissões (Viewers)</h1>
      </div>

      {viewers.length === 0 ? (
        <p className="text-gray-500">Nenhum usuário com role &quot;viewer&quot; encontrado.</p>
      ) : (
        <PermissionsTable
          users={viewers.map((u) => ({ id: u.id, name: u.name ?? u.email, email: u.email }))}
          applications={applications}
          permissionMap={permissionMap}
        />
      )}
    </div>
  );
}
