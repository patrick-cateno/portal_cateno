import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const items = [
  { value: 'tab1', label: 'Tab One' },
  { value: 'tab2', label: 'Tab Two' },
  { value: 'tab3', label: 'Tab Three', disabled: true },
];

describe('Tabs', () => {
  it('renders all tab buttons', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeInTheDocument();
  });

  it('first tab is selected by default', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  it('changes selected tab on click', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'false');
  });

  it('active tab has teal text class', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveClass('text-primary-600');
  });

  it('calls onValueChange on tab click', () => {
    const onValueChange = vi.fn();
    render(<Tabs items={items} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(onValueChange).toHaveBeenCalledWith('tab2');
  });

  it('disabled tab does not call onValueChange', () => {
    const onValueChange = vi.fn();
    render(<Tabs items={items} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab Three' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('TabsContent', () => {
  it('renders when value matches activeValue', () => {
    render(
      <TabsContent value="tab1" activeValue="tab1">
        Tab One content
      </TabsContent>,
    );
    expect(screen.getByText('Tab One content')).toBeInTheDocument();
  });

  it('does not render when value does not match activeValue', () => {
    render(
      <TabsContent value="tab1" activeValue="tab2">
        Tab One content
      </TabsContent>,
    );
    expect(screen.queryByText('Tab One content')).not.toBeInTheDocument();
  });
});
