'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

interface LayoutContextValue {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile drawer
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

const STORAGE_KEY = 'portal-cateno-sidebar-collapsed';

function getStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

// Read initial value from localStorage without useEffect
function useInitialCollapsed(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => getStoredCollapsed(),
    () => false,
  );
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const initialCollapsed = useInitialCollapsed();
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(initialCollapsed);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const openMobileDrawer = useCallback(() => setSidebarOpen(true), []);
  const closeMobileDrawer = useCallback(() => setSidebarOpen(false), []);

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapsed,
        sidebarOpen,
        toggleSidebar,
        setSidebarCollapsed,
        openMobileDrawer,
        closeMobileDrawer,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within <LayoutProvider>');
  return ctx;
}
