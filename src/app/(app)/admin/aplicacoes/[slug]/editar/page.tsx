import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AppWindow } from 'lucide-react';
import { ApplicationForm } from '@/components/features/admin/application-form';
import { updateApplication } from '../../actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Aplicação — Admin',
};

export default async function EditarAplicacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [application, categories] = await Promise.all([
    prisma.application.findUnique({ where: { slug } }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  if (!application) notFound();

  const boundUpdate = updateApplication.bind(null, application.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AppWindow className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Editar: {application.name}</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ApplicationForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          action={boundUpdate}
          defaultValues={{
            name: application.name,
            slug: application.slug,
            description: application.description ?? '',
            icon: application.icon ?? '',
            categoryId: application.categoryId,
            url: application.url ?? '',
            healthCheckUrl: application.healthCheckUrl ?? '',
            integrationType: application.integrationType as 'redirect' | 'embed' | 'modal',
            order: application.order,
          }}
        />
      </div>
    </div>
  );
}
