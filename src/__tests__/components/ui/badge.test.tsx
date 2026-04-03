import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Online</Badge>);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders online variant with lime classes', () => {
    render(<Badge variant="online">Online</Badge>);
    const badge = screen.getByText('Online');
    expect(badge).toHaveClass('bg-lime-50');
    expect(badge).toHaveClass('text-lime-600');
  });

  it('renders maintenance variant with amber classes', () => {
    render(<Badge variant="maintenance">Maintenance</Badge>);
    expect(screen.getByText('Maintenance')).toHaveClass('bg-amber-50');
  });

  it('renders offline variant with red classes', () => {
    render(<Badge variant="offline">Offline</Badge>);
    expect(screen.getByText('Offline')).toHaveClass('bg-red-50');
  });

  it('renders primary variant', () => {
    render(<Badge variant="primary">Feature</Badge>);
    expect(screen.getByText('Feature')).toHaveClass('bg-primary-50');
  });

  it('renders dot indicator when dot=true', () => {
    const { container } = render(
      <Badge variant="online" dot>
        Online
      </Badge>,
    );
    const dots = container.querySelectorAll('[aria-hidden="true"]');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('renders size sm', () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-2');
  });

  it('renders size lg', () => {
    render(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3');
  });

  it('accepts className prop', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('custom-class');
  });
});
