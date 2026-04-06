import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth-actions
vi.mock('@/lib/auth-actions', () => ({
  loginAction: vi.fn(),
}));

// Mock LoginButton as a simple component to test the page structure
vi.mock('../../../app/(auth)/login/login-button', () => ({
  LoginButton: () => <button>Entrar com Login Cateno</button>,
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  it('should render the welcome heading', () => {
    render(<LoginPage />);
    expect(screen.getByText('Bem-vindo ao CatIA Super App')).toBeInTheDocument();
  });

  it('should render the subheading', () => {
    render(<LoginPage />);
    expect(screen.getByText('Acesse suas aplicacoes')).toBeInTheDocument();
  });

  it('should render the login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Entrar com Login Cateno')).toBeInTheDocument();
  });

  it('should render the Keycloak attribution text', () => {
    render(<LoginPage />);
    expect(screen.getByText('Autenticacao segura via Keycloak')).toBeInTheDocument();
  });

  it('should render the CatenoLogo', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Logo Cateno')).toBeInTheDocument();
  });

  it('should have gradient background', () => {
    const { container } = render(<LoginPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('bg-gradient-to-br');
    expect(wrapper.className).toContain('from-primary-600');
    expect(wrapper.className).toContain('to-primary-800');
  });
});
