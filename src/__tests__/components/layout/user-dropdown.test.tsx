import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: {
        name: 'Patrick Iarrocheski',
        email: 'patrick@cateno.com.br',
        image: null,
        roles: ['admin'],
      },
    },
    status: 'authenticated',
  })),
}));

vi.mock('@/lib/auth-actions', () => ({
  logoutAction: vi.fn().mockResolvedValue({ redirectUrl: 'https://keycloak/logout' }),
}));

import { UserDropdown } from '@/components/layout/user-dropdown';

describe('UserDropdown', () => {
  it('should render avatar with user initials', () => {
    render(<UserDropdown />);
    expect(screen.getByText('PI')).toBeInTheDocument();
  });

  it('should show dropdown with user info when clicked', () => {
    render(<UserDropdown />);
    fireEvent.click(screen.getByText('PI'));
    expect(screen.getByText('Patrick Iarrocheski')).toBeInTheDocument();
    expect(screen.getByText('patrick@cateno.com.br')).toBeInTheDocument();
  });

  it('should show menu options', () => {
    render(<UserDropdown />);
    fireEvent.click(screen.getByText('PI'));
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByText('Configuracoes')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('should call logoutAction when Sair is clicked', async () => {
    const { logoutAction } = await import('@/lib/auth-actions');
    render(<UserDropdown />);
    fireEvent.click(screen.getByText('PI'));
    fireEvent.click(screen.getByText('Sair'));
    expect(logoutAction).toHaveBeenCalled();
  });
});
