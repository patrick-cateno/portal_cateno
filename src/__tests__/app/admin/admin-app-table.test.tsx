import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() })),
}));

// Mock server actions
vi.mock('@/app/(app)/admin/aplicacoes/actions', () => ({
  archiveApplication: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { AdminAppTable } from '@/components/features/admin/admin-app-table';

const apps = [
  {
    id: '1',
    name: 'Gestão de Cartões',
    slug: 'gestao-cartoes',
    icon: 'CreditCard',
    status: 'online',
    categoryName: 'Cartões',
    userCount: 2340,
    lastHealthCheck: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Tesouraria',
    slug: 'tesouraria',
    icon: 'Landmark',
    status: 'offline',
    categoryName: 'Financeiro',
    userCount: 450,
    lastHealthCheck: null,
  },
];

describe('AdminAppTable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders application rows', () => {
    render(<AdminAppTable applications={apps} search="" status="" page={1} totalPages={1} />);
    expect(screen.getByText('Gestão de Cartões')).toBeInTheDocument();
    expect(screen.getByText('Tesouraria')).toBeInTheDocument();
  });

  it('shows empty message when no apps', () => {
    render(<AdminAppTable applications={[]} search="" status="" page={1} totalPages={1} />);
    expect(screen.getByText('Nenhuma aplicação encontrada.')).toBeInTheDocument();
  });

  it('renders category badges', () => {
    render(<AdminAppTable applications={apps} search="" status="" page={1} totalPages={1} />);
    expect(screen.getByText('Cartões')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
  });

  it('renders pagination when multiple pages', () => {
    render(<AdminAppTable applications={apps} search="" status="" page={1} totalPages={3} />);
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeDisabled();
    expect(screen.getByText('Próxima')).not.toBeDisabled();
  });

  it('hides pagination when single page', () => {
    render(<AdminAppTable applications={apps} search="" status="" page={1} totalPages={1} />);
    expect(screen.queryByText('Próxima')).not.toBeInTheDocument();
  });

  it('renders search input with current value', () => {
    render(<AdminAppTable applications={apps} search="cartao" status="" page={1} totalPages={1} />);
    const input = screen.getByPlaceholderText('Buscar por nome ou slug...');
    expect(input).toHaveValue('cartao');
  });
});
