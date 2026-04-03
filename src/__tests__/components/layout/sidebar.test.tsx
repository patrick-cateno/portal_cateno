import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/inicio'),
}));

vi.mock('@/hooks/use-layout', () => ({
  useLayout: vi.fn(() => ({
    sidebarCollapsed: false,
    toggleSidebar: vi.fn(),
  })),
}));

import { Sidebar } from '@/components/layout/sidebar';

describe('Sidebar', () => {
  it('should render navigation items for user role', () => {
    render(<Sidebar userRoles={['user']} />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Favoritos')).toBeInTheDocument();
    expect(screen.getByText('Suporte')).toBeInTheDocument();
  });

  it('should show Admin item only for admin role', () => {
    render(<Sidebar userRoles={['admin']} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should hide Admin item for user role', () => {
    render(<Sidebar userRoles={['user']} />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should show viewer-accessible items for viewer role', () => {
    render(<Sidebar userRoles={['viewer']} />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Suporte')).toBeInTheDocument();
    expect(screen.queryByText('Favoritos')).not.toBeInTheDocument();
  });

  it('should have navigation aria-label', () => {
    render(<Sidebar userRoles={['user']} />);
    expect(screen.getByLabelText('Navegacao principal')).toBeInTheDocument();
  });

  it('should render version text', () => {
    render(<Sidebar userRoles={['user']} />);
    expect(screen.getByText('v1.0.0-beta')).toBeInTheDocument();
  });
});
