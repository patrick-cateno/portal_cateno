import { prisma } from '@/lib/db';
import { Wrench } from 'lucide-react';
import { ToolsTable } from '@/components/features/admin/tools-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools — Admin',
};

export default async function AdminToolsPage() {
  const tools = await prisma.microserviceTool.findMany({
    include: { application: { select: { name: true, slug: true } } },
    orderBy: [{ application: { name: 'asc' } }, { name: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Tools Registradas</h1>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
          {tools.length}
        </span>
      </div>

      <ToolsTable
        tools={tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          applicationName: t.application.name,
          method: t.method,
          endpoint: t.endpoint,
          requiredRole: t.requiredRole,
          isActive: t.isActive,
        }))}
      />
    </div>
  );
}
