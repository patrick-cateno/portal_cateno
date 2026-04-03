import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/aplicacoes'),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@cateno.com.br',
        image: null,
        roles: ['user'],
      },
    },
    status: 'authenticated',
  })),
}));

vi.mock('@/lib/auth-actions', () => ({
  logoutAction: vi.fn().mockResolvedValue({ redirectUrl: '' }),
}));

vi.mock('@/hooks/use-layout', () => ({
  useLayout: vi.fn(() => ({
    sidebarCollapsed: false,
    toggleSidebar: vi.fn(),
    openMobileDrawer: vi.fn(),
  })),
}));

import { Header } from '@/components/layout/header';

describe('Header', () => {
  it('should render CatenoLogo', () => {
    render(<Header />);
    expect(screen.getByLabelText('Logo Cateno')).toBeInTheDocument();
  });

  it('should render view toggle with Aplicacoes and CatIA', () => {
    render(<Header />);
    // "Aplicacoes" appears in both breadcrumb and view toggle
    expect(screen.getAllByText('Aplicacoes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('CatIA')).toBeInTheDocument();
  });

  it('should render search trigger', () => {
    render(<Header />);
    expect(screen.getByText('Buscar...')).toBeInTheDocument();
  });

  it('should render notification bell', () => {
    render(<Header />);
    expect(screen.getByLabelText('Notificacoes')).toBeInTheDocument();
  });

  it('should render user avatar', () => {
    render(<Header />);
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('should render sidebar toggle button', () => {
    render(<Header />);
    expect(screen.getByLabelText('Recolher sidebar')).toBeInTheDocument();
  });
});
