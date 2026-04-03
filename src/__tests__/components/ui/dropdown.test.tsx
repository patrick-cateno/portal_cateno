import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui';

function TestDropdown({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <Dropdown>
      <DropdownTrigger>Open Menu</DropdownTrigger>
      <DropdownContent>
        <DropdownItem onClick={onItemClick}>Item 1</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Item 2</DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

describe('Dropdown', () => {
  it('should not show content by default', () => {
    render(<TestDropdown />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should show content when trigger is clicked', () => {
    render(<TestDropdown />);
    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should close when trigger is clicked again', () => {
    render(<TestDropdown />);
    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should close on Escape key', () => {
    render(<TestDropdown />);
    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should call onClick and close when item is clicked', () => {
    const onClick = vi.fn();
    render(<TestDropdown onItemClick={onClick} />);
    fireEvent.click(screen.getByText('Open Menu'));
    fireEvent.click(screen.getByText('Item 1'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should render separator', () => {
    render(<TestDropdown />);
    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('should have aria-expanded on trigger', () => {
    render(<TestDropdown />);
    const trigger = screen.getByText('Open Menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
