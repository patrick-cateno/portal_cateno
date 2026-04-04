'use client';

import { Search, X, ArrowUpDown, Star } from 'lucide-react';
import type { CategoryItem } from '@/types';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  categories: CategoryItem[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: () => void;
  filteredCount: number;
  totalCount: number;
}

export function AplicacoesToolbar({
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  showFavoritesOnly,
  onFavoritesToggle,
  filteredCount,
  totalCount,
}: Props) {
  return (
    <div className="sticky top-16 z-40 space-y-4 bg-white pb-4">
      {/* Row 1: Title */}
      <h1 className="text-2xl font-bold text-neutral-900">Aplicações</h1>

      {/* Row 2: Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            placeholder="Buscar aplicações..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pr-9 pl-10 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 appearance-none rounded-lg border border-neutral-200 bg-white pr-8 pl-10 text-sm text-neutral-700 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          >
            <option value="name">Nome (A-Z)</option>
            <option value="users">Usuários (mais usado)</option>
            <option value="trend">Trend (popular)</option>
          </select>
        </div>
      </div>

      {/* Row 3: Category chips + Favorites + Count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onCategoryChange('todas')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === 'todas'
                ? 'bg-teal-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-teal-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFavoritesToggle}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              showFavoritesOnly
                ? 'bg-teal-100 text-teal-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-teal-600' : ''}`} />
            Favoritos
          </button>
          <span className="shrink-0 text-sm text-neutral-500">
            {filteredCount} de {totalCount} aplicações
          </span>
        </div>
      </div>
    </div>
  );
}
