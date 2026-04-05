import { prisma } from '@/lib/db';
import { AppWindow } from 'lucide-react';
import { ApplicationForm } from '@/components/features/admin/application-form';
import { createApplication } from '../actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nova Aplicação — Admin',
};

export default async function NovaAplicacaoPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AppWindow className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Nova Aplicação</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ApplicationForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          action={createApplication}
        />
      </div>
    </div>
  );
}
