import { useEffect } from 'react';

interface ShortcutOptions {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  callback: () => void;
}

export function useKeyboardShortcut({ key, meta, ctrl, callback }: ShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMeta = meta ? event.metaKey : true;
      const isCtrl = ctrl ? event.ctrlKey : true;

      if (event.key.toLowerCase() === key.toLowerCase() && isMeta && isCtrl) {
        event.preventDefault();
        callback();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, meta, ctrl, callback]);
}

/** Shortcut for Cmd+K (Mac) or Ctrl+K (Windows/Linux) */
export function useCmdK(callback: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        callback();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
