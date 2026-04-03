import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with default primary variant', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-primary-600');
  });

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-neutral-100');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-neutral-100');
  });

  it('renders destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-primary-200');
  });

  it('renders size sm', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
  });

  it('renders size lg', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler on click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('accepts className prop', () => {
    render(<Button className="extra-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
