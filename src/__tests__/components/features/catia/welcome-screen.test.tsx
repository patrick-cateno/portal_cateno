import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeScreen } from '@/components/features/catia/welcome-screen';

describe('WelcomeScreen', () => {
  it('should render greeting', () => {
    render(<WelcomeScreen onQuickAction={vi.fn()} />);
    expect(screen.getByText('Olá! Eu sou a CatIA')).toBeInTheDocument();
  });

  it('should render 4 quick action buttons', () => {
    render(<WelcomeScreen onQuickAction={vi.fn()} />);
    expect(screen.getByText('Status de Apps')).toBeInTheDocument();
    expect(screen.getByText('Populares')).toBeInTheDocument();
    expect(screen.getByText('Anti-fraude')).toBeInTheDocument();
    expect(screen.getByText('Ajuda')).toBeInTheDocument();
  });

  it('should call onQuickAction with correct prompt when Status clicked', () => {
    const onAction = vi.fn();
    render(<WelcomeScreen onQuickAction={onAction} />);

    fireEvent.click(screen.getByText('Status de Apps'));
    expect(onAction).toHaveBeenCalledWith('Qual é o status de todas as aplicações?');
  });

  it('should call onQuickAction with correct prompt when Ajuda clicked', () => {
    const onAction = vi.fn();
    render(<WelcomeScreen onQuickAction={onAction} />);

    fireEvent.click(screen.getByText('Ajuda'));
    expect(onAction).toHaveBeenCalledWith('Como posso usar a CatIA?');
  });

  it('should render description text', () => {
    render(<WelcomeScreen onQuickAction={vi.fn()} />);
    expect(screen.getByText(/Sua assistente para navegar aplicações Cateno/)).toBeInTheDocument();
  });
});
