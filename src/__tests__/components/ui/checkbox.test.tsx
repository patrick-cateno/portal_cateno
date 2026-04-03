import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Checkbox label="Option" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders as checked when defaultChecked=true', () => {
    render(<Checkbox label="Option" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<Checkbox label="Option" helperText="This is required" />);
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  it('toggles state on click', () => {
    render(<Checkbox label="Option" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('calls onChange with true when checked', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Option" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Checkbox label="Option" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('works as controlled component', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Option" checked={false} onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
