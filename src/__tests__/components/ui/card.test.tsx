import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

describe('Card', () => {
  it('renders with default classes', () => {
    const { container } = render(<Card data-testid="card">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-sm');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('shadow-sm');
  });

  it('renders with padding none', () => {
    const { container } = render(<Card padding="none">Content</Card>);
    expect(container.firstChild).toHaveClass('p-0');
  });

  it('renders with padding lg', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('p-6');
  });

  it('renders with shadow lg', () => {
    const { container } = render(<Card shadow="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');
  });

  it('renders with border none', () => {
    const { container } = render(<Card border="none">No border</Card>);
    expect(container.firstChild).not.toHaveClass('border');
  });

  it('renders CardHeader and CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Card</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('My Card')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveClass('text-lg');
  });

  it('renders CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>A description</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('A description')).toHaveClass('text-neutral-500');
  });

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Body text</CardContent>
      </Card>,
    );
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
