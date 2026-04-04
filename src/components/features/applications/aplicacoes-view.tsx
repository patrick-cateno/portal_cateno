'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { toggleFavorite } from '@/app/(app)/aplicacoes/actions';
import { ApplicationCard } from './application-card';
import { AplicacoesToolbar } from './aplicacoes-toolbar';
import { EmptyState } from './empty-state';
import type { ApplicationCard as AppCardType, CategoryItem } from '@/types';

interface Props {
  initialApps: AppCardType[];
  initialCategories: CategoryItem[];
  initialFavoriteIds: string[];
}

export function AplicacoesView({ initialApps, initialCategories, initialFavoriteIds }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'todas');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    searchParams.get('filtro') === 'favoritos',
  );
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));

  const debouncedSearch = useDebounce(search, 300);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category !== 'todas') params.set('category', category);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (showFavoritesOnly) params.set('filtro', 'favoritos');

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  }, [debouncedSearch, category, sortBy, showFavoritesOnly, pathname, router]);

  // Filter and sort
  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return initialApps
      .filter((app) => {
        if (searchLower) {
          const matchesName = app.name.toLowerCase().includes(searchLower);
          const matchesDesc = app.description?.toLowerCase().includes(searchLower);
          if (!matchesName && !matchesDesc) return false;
        }
        if (category !== 'todas' && app.categorySlug !== category) return false;
        if (showFavoritesOnly && !favoriteIds.has(app.id)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'users') return b.userCount - a.userCount;
        if (sortBy === 'trend') return b.trend - a.trend;
        return a.name.localeCompare(b.name, 'pt-BR');
      });
  }, [initialApps, debouncedSearch, category, sortBy, showFavoritesOnly, favoriteIds]);

  const handleToggleFavorite = useCallback(
    async (appId: string) => {
      const wasFavorited = favoriteIds.has(appId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.delete(appId);
        } else {
          next.add(appId);
        }
        return next;
      });

      try {
        await toggleFavorite(appId);
      } catch {
        // Revert on error
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) {
            next.add(appId);
          } else {
            next.delete(appId);
          }
          return next;
        });
      }
    },
    [favoriteIds],
  );

  const handleReset = useCallback(() => {
    setSearch('');
    setCategory('todas');
    setSortBy('name');
    setShowFavoritesOnly(false);
  }, []);

  return (
    <div className="space-y-6">
      <AplicacoesToolbar
        search={search}
        onSearchChange={setSearch}
        categories={initialCategories}
        activeCategory={category}
        onCategoryChange={setCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesToggle={() => setShowFavoritesOnly((prev) => !prev)}
        filteredCount={filtered.length}
        totalCount={initialApps.length}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={handleReset} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              isFavorited={favoriteIds.has(app.id)}
              onToggleFavorite={() => handleToggleFavorite(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
