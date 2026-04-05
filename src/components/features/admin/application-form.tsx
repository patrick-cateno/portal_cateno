'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CreateApplicationSchema } from '@/lib/validations/application';
import { z } from 'zod';

type FormValues = z.input<typeof CreateApplicationSchema>;

interface Props {
  categories: Array<{ id: string; name: string }>;
  action: (formData: FormData) => Promise<{ success?: boolean; error?: Record<string, string[]> }>;
  defaultValues?: Partial<FormValues>;
}

export function ApplicationForm({ categories, action, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!defaultValues;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateApplicationSchema) as any,
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      description: defaultValues?.description ?? '',
      icon: defaultValues?.icon ?? '',
      categoryId: defaultValues?.categoryId ?? '',
      url: defaultValues?.url ?? '',
      healthCheckUrl: defaultValues?.healthCheckUrl ?? '',
      integrationType: defaultValues?.integrationType ?? 'redirect',
      order: defaultValues?.order ?? 99,
    },
  });

  function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) fd.set(key, String(value));
    });

    startTransition(async () => {
      const result = await action(fd);
      if (result.error) {
        for (const [field, messages] of Object.entries(result.error)) {
          setError(field as keyof FormValues, { message: messages[0] });
        }
        toast.error('Corrija os erros do formulário');
      } else {
        toast.success(isEditing ? 'Aplicação atualizada' : 'Aplicação criada');
        router.push('/admin/aplicacoes');
      }
    });
  }

  const fieldClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nome *</label>
          <input {...register('name')} className={fieldClass} placeholder="Gestão de Cartões" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Slug *</label>
          <input {...register('slug')} className={fieldClass} placeholder="gestao-cartoes" />
          {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Descrição</label>
          <textarea {...register('description')} className={fieldClass} rows={2} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Categoria *</label>
          <select {...register('categoryId')} className={fieldClass}>
            <option value="">Selecionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Ícone (Lucide)</label>
          <input {...register('icon')} className={fieldClass} placeholder="CreditCard" />
        </div>

        <div>
          <label className={labelClass}>Tipo de Integração</label>
          <select {...register('integrationType')} className={fieldClass}>
            <option value="redirect">Redirect</option>
            <option value="embed">Embed (iframe)</option>
            <option value="modal">Modal</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Ordem</label>
          <input
            {...register('order', { valueAsNumber: true })}
            type="number"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>URL Frontend</label>
          <input {...register('url')} className={fieldClass} placeholder="https://..." />
          {errors.url && <p className={errorClass}>{errors.url.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Health Check URL</label>
          <input
            {...register('healthCheckUrl')}
            className={fieldClass}
            placeholder="https://.../health"
          />
          {errors.healthCheckUrl && <p className={errorClass}>{errors.healthCheckUrl.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Aplicação'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
