import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from '@/components/ui/toggle';

describe('Toggle', () => {
  it('renders a switch button', () => {
    render(<Toggle />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('is off by default', () => {
    render(<Toggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders as on when defaultChecked=true', () => {
    render(<Toggle defaultChecked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('shows teal background when on', () => {
    render(<Toggle defaultChecked />);
    expect(screen.getByRole('switch')).toHaveClass('bg-primary-600');
  });

  it('shows neutral background when off', () => {
    render(<Toggle />);
    expect(screen.getByRole('switch')).toHaveClass('bg-neutral-200');
  });

  it('toggles state on click', () => {
    render(<Toggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with new value on click', () => {
    const onChange = vi.fn();
    render(<Toggle onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders label', () => {
    render(<Toggle label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Toggle disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
