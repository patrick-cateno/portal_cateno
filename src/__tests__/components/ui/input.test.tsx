import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" placeholder="email@example.com" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<Input helperText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input error helperText="This field is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-error');
  });

  it('has teal focus class', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus:border-primary-600');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('calls onChange handler on input', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders size sm', () => {
    render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-8');
  });

  it('renders size lg', () => {
    render(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-11');
  });
});
