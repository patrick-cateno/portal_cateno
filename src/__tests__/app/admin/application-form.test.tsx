import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ApplicationForm } from '@/components/features/admin/application-form';

const categories = [
  { id: 'cat-1', name: 'Cartões' },
  { id: 'cat-2', name: 'Financeiro' },
];

const mockAction = vi.fn().mockResolvedValue({ success: true });

describe('ApplicationForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all form fields', () => {
    render(<ApplicationForm categories={categories} action={mockAction} />);
    expect(screen.getByPlaceholderText('Gestão de Cartões')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('gestao-cartoes')).toBeInTheDocument();
    expect(screen.getByText('Criar Aplicação')).toBeInTheDocument();
  });

  it('renders category options', () => {
    render(<ApplicationForm categories={categories} action={mockAction} />);
    expect(screen.getByText('Cartões')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
  });

  it('shows Salvar Alterações when editing', () => {
    render(
      <ApplicationForm
        categories={categories}
        action={mockAction}
        defaultValues={{
          name: 'Test',
          slug: 'test',
          categoryId: 'cat-1',
          integrationType: 'redirect',
        }}
      />,
    );
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<ApplicationForm categories={categories} action={mockAction} />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('renders integration type options', () => {
    render(<ApplicationForm categories={categories} action={mockAction} />);
    expect(screen.getByText('Redirect')).toBeInTheDocument();
    expect(screen.getByText('Embed (iframe)')).toBeInTheDocument();
    expect(screen.getByText('Modal')).toBeInTheDocument();
  });
});
