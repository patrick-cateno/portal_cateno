'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useCmdK } from '@/hooks/use-keyboard-shortcut';
import { cn } from '@/lib/utils';

export function SearchTrigger({ className }: { className?: string }) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  useCmdK(openOverlay);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openOverlay}
        className={cn(
          'hidden items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-white md:flex',
          className,
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="ml-2 rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
          ⌘K
        </kbd>
      </button>

      {/* Overlay placeholder */}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeOverlay} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar aplicacoes..."
                className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                onKeyDown={(e) => e.key === 'Escape' && closeOverlay()}
              />
              <button
                type="button"
                onClick={closeOverlay}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-neutral-400">
              Busca global em breve (SPEC-007)
            </p>
          </div>
        </div>
      )}
    </>
  );
}
