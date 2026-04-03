import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatenoLogo } from '@/components/ui/CatenoLogo';

describe('CatenoLogo', () => {
  it('renders SVG with default size md', () => {
    render(<CatenoLogo />);
    const svg = screen.getByRole('img', { name: /logo cateno/i });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '90');
    expect(svg).toHaveAttribute('height', '34');
  });

  it('renders size sm correctly', () => {
    render(<CatenoLogo size="sm" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '23');
  });

  it('renders size lg correctly', () => {
    render(<CatenoLogo size="lg" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '46');
  });

  it('always uses viewBox 0 0 120 46', () => {
    render(<CatenoLogo />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('viewBox', '0 0 120 46');
  });

  it('has aria-label for accessibility', () => {
    render(<CatenoLogo />);
    expect(screen.getByRole('img', { name: 'Logo Cateno' })).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    render(<CatenoLogo className="test-class" />);
    expect(screen.getByRole('img')).toHaveClass('test-class');
  });
});
