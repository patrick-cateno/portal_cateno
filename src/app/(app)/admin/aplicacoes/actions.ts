'use server';

import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { CreateApplicationSchema } from '@/lib/validations/application';

export async function createApplication(formData: FormData) {
  await requireRole('admin');

  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    categoryId: formData.get('categoryId'),
    url: formData.get('url') || undefined,
    healthCheckUrl: formData.get('healthCheckUrl') || undefined,
    integrationType: formData.get('integrationType') || 'redirect',
    order: Number(formData.get('order') || 99),
  };

  const parsed = CreateApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.application.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: { slug: ['Slug já existe'] } };
  }

  await prisma.application.create({ data: parsed.data });

  revalidatePath('/aplicacoes');
  revalidatePath('/admin/aplicacoes');
  return { success: true };
}

export async function updateApplication(id: string, formData: FormData) {
  await requireRole('admin');

  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    categoryId: formData.get('categoryId'),
    url: formData.get('url') || undefined,
    healthCheckUrl: formData.get('healthCheckUrl') || undefined,
    integrationType: formData.get('integrationType') || 'redirect',
    order: Number(formData.get('order') || 99),
  };

  const parsed = CreateApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Check slug conflict with another app
  const conflict = await prisma.application.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflict) {
    return { error: { slug: ['Slug já existe em outra aplicação'] } };
  }

  await prisma.application.update({ where: { id }, data: parsed.data });

  revalidatePath('/aplicacoes');
  revalidatePath('/admin/aplicacoes');
  return { success: true };
}

export async function archiveApplication(id: string) {
  await requireRole('admin');

  await prisma.application.update({
    where: { id },
    data: { status: 'archived' },
  });

  revalidatePath('/aplicacoes');
  revalidatePath('/admin/aplicacoes');
  return { success: true };
}
