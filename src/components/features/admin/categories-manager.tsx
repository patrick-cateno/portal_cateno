'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/app/(app)/admin/categorias/actions';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  appCount: number;
}

function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryRow;
  onEdit: (cat: CategoryRow) => void;
  onDelete: (cat: CategoryRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-100 bg-white">
      <td className="px-4 py-3">
        <button
          type="button"
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
      <td className="px-4 py-3 text-gray-500">{category.slug}</td>
      <td className="px-4 py-3 text-gray-500">{category.icon ?? '—'}</td>
      <td className="px-4 py-3 text-gray-500">{category.appCount}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-teal-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CategoriesManager({ categories: initial }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    startTransition(async () => {
      const result = await reorderCategories(reordered.map((c) => c.id));
      if (result.success) toast.success('Ordem atualizada');
    });
  }

  async function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const result: { success?: boolean; error?: Record<string, string[]> } = editing
        ? await updateCategory(editing.id, fd)
        : await createCategory(fd);
      if (result.error) {
        const firstErr = Object.values(result.error).flat()[0];
        toast.error(firstErr ?? 'Corrija os erros');
      } else {
        toast.success(editing ? 'Categoria atualizada' : 'Categoria criada');
        setShowForm(false);
        setEditing(null);
        router.refresh();
      }
    });
  }

  async function handleDelete(cat: CategoryRow) {
    if (!confirm(`Excluir "${cat.name}"?`)) return;
    startTransition(async () => {
      const result: { success?: boolean; error?: string } = await deleteCategory(cat.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Categoria excluída');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Create / Edit form */}
      {(showForm || editing) && (
        <form
          action={handleSubmit}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
            <input
              name="name"
              defaultValue={editing?.name ?? ''}
              required
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input
              name="slug"
              defaultValue={editing?.slug ?? ''}
              required
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ícone</label>
            <input
              name="icon"
              defaultValue={editing?.icon ?? ''}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-teal-600 p-2 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditing(null);
            }}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      )}

      {!showForm && !editing && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" /> Nova Categoria
        </button>
      )}

      {/* Table with drag-and-drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="px-4 py-3 font-medium text-gray-600">Ícone</th>
                <th className="px-4 py-3 font-medium text-gray-600">Apps</th>
                <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {categories.map((cat) => (
                  <SortableRow
                    key={cat.id}
                    category={cat}
                    onEdit={(c) => setEditing(c)}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>
    </div>
  );
}
