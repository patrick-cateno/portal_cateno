import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationCard } from '@/components/features/applications/application-card';
import type { ApplicationCard as AppCardType } from '@/types';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockApp: AppCardType = {
  id: '1',
  name: 'Gestão de Cartões',
  slug: 'gestao-cartoes',
  description: 'Gerenciamento completo de cartões e limites.',
  icon: 'CreditCard',
  categoryId: 'cat-1',
  categoryName: 'Cartões',
  categorySlug: 'cartoes',
  status: 'online',
  url: '/apps/gestao-cartoes',
  userCount: 2340,
  trend: 12.5,
};

describe('ApplicationCard', () => {
  it('should render app name as h3', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Gestão de Cartões' }),
    ).toBeInTheDocument();
  });

  it('should render category name', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('Cartões')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('Gerenciamento completo de cartões e limites.')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should format user count with k', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('2.3k')).toBeInTheDocument();
  });

  it('should render positive trend', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('should render negative trend', () => {
    const app = { ...mockApp, trend: -3.2 };
    render(<ApplicationCard app={app} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('-3.2%')).toBeInTheDocument();
  });

  it('should call onToggleFavorite when star is clicked', () => {
    const onToggle = vi.fn();
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={onToggle} />);

    fireEvent.click(screen.getByLabelText('Favoritar Gestão de Cartões'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('should show filled star when favorited', () => {
    render(<ApplicationCard app={mockApp} isFavorited={true} onToggleFavorite={vi.fn()} />);
    expect(screen.getByLabelText('Remover Gestão de Cartões dos favoritos')).toBeInTheDocument();
  });

  it('should have role article', () => {
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('should render maintenance status', () => {
    const app = { ...mockApp, status: 'maintenance' as const };
    render(<ApplicationCard app={app} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('Manutenção')).toBeInTheDocument();
  });

  it('should render offline status', () => {
    const app = { ...mockApp, status: 'offline' as const };
    render(<ApplicationCard app={app} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should render fallback letter when icon is unknown', () => {
    const app = { ...mockApp, icon: 'UnknownIcon' };
    render(<ApplicationCard app={app} isFavorited={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByText('G')).toBeInTheDocument(); // First letter of "Gestão"
  });

  it('should navigate to app url on click', () => {
    mockPush.mockClear();
    render(<ApplicationCard app={mockApp} isFavorited={false} onToggleFavorite={vi.fn()} />);
    fireEvent.click(screen.getByRole('article'));
    expect(mockPush).toHaveBeenCalledWith('/apps/gestao-cartoes');
  });

  it('should not navigate when url is null', () => {
    mockPush.mockClear();
    const app = { ...mockApp, url: null };
    render(<ApplicationCard app={app} isFavorited={false} onToggleFavorite={vi.fn()} />);
    fireEvent.click(screen.getByRole('article'));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
