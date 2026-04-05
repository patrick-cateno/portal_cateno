'use server';

import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CategorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  icon: z.string().max(50).optional(),
});

export async function createCategory(formData: FormData) {
  await requireRole('admin');

  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    icon: formData.get('icon') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: { slug: ['Slug já existe'] } };
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  await prisma.category.create({
    data: { ...parsed.data, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidatePath('/admin/categorias');
  revalidatePath('/aplicacoes');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireRole('admin');

  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    icon: formData.get('icon') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const conflict = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflict) {
    return { error: { slug: ['Slug já existe'] } };
  }

  await prisma.category.update({ where: { id }, data: parsed.data });

  revalidatePath('/admin/categorias');
  revalidatePath('/aplicacoes');
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireRole('admin');

  const appCount = await prisma.application.count({ where: { categoryId: id } });
  if (appCount > 0) {
    return { error: `Categoria possui ${appCount} aplicação(ões). Mova-as antes de excluir.` };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath('/admin/categorias');
  revalidatePath('/aplicacoes');
  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  await requireRole('admin');

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidatePath('/admin/categorias');
  revalidatePath('/aplicacoes');
  return { success: true };
}
