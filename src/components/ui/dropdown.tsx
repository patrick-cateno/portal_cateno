'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// --- Context ---

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown components must be used within <Dropdown>');
  return ctx;
}

// --- Dropdown Root ---

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

function Dropdown({ children, className }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const toggle = React.useCallback(() => setOpen((prev) => !prev), []);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, toggle }}>
      <div ref={ref} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// --- Trigger ---

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { open, toggle } = useDropdown();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn('cursor-pointer', className)}
    >
      {children}
    </button>
  );
}

// --- Content ---

interface DropdownContentProps {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

function DropdownContent({ children, align = 'right', className }: DropdownContentProps) {
  const { open } = useDropdown();

  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        'absolute top-full z-50 mt-1 min-w-[200px] rounded-md border border-neutral-200 bg-white py-1 shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

// --- Item ---

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

function DropdownItem({ children, onClick, className, disabled }: DropdownItemProps) {
  const { setOpen } = useDropdown();

  function handleClick() {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700',
        'hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

// --- Separator ---

function DropdownSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn('my-1 h-px bg-neutral-200', className)} />;
}

// --- Label (non-interactive header inside dropdown) ---

function DropdownLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-3 py-2 text-xs font-medium text-neutral-500', className)}>
      {children}
    </div>
  );
}

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
};
