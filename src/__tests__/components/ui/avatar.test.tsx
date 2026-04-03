import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/components/ui';

describe('Avatar', () => {
  it('should render initials when no image provided', () => {
    render(<Avatar name="Patrick Iarrocheski" />);
    expect(screen.getByText('PI')).toBeInTheDocument();
  });

  it('should render single initial for single name', () => {
    render(<Avatar name="Patrick" />);
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('should render ? when no name provided', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should render image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="Test User" />);
    const img = screen.getByAltText('Test User');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should apply size variants', () => {
    const { container } = render(<Avatar name="Test" size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-10');
    expect(el.className).toContain('w-10');
  });

  it('should apply custom className', () => {
    const { container } = render(<Avatar name="Test" className="custom-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-class');
  });
});
