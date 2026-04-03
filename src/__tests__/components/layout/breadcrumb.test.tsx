import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';

const mockUsePathname = vi.mocked(usePathname);

describe('Breadcrumb', () => {
  it('should render segments from pathname', () => {
    mockUsePathname.mockReturnValue('/aplicacoes');
    render(<Breadcrumb />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Aplicacoes')).toBeInTheDocument();
  });

  it('should render nested segments', () => {
    mockUsePathname.mockReturnValue('/aplicacoes/cartoes');
    render(<Breadcrumb />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Aplicacoes')).toBeInTheDocument();
    expect(screen.getByText('cartoes')).toBeInTheDocument();
  });

  it('should mark last segment as current page', () => {
    mockUsePathname.mockReturnValue('/aplicacoes');
    render(<Breadcrumb />);
    expect(screen.getByText('Aplicacoes')).toHaveAttribute('aria-current', 'page');
  });

  it('should make non-last segments clickable links', () => {
    mockUsePathname.mockReturnValue('/aplicacoes/cartoes');
    render(<Breadcrumb />);
    const link = screen.getByText('Aplicacoes');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/aplicacoes');
  });

  it('should return null for root path', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('should have aria-label', () => {
    mockUsePathname.mockReturnValue('/inicio');
    render(<Breadcrumb />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });
});
