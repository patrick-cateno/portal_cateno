import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/features/catia/chat-input';

describe('ChatInput', () => {
  it('should render textarea with placeholder', () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(
      screen.getByPlaceholderText('Pergunte sobre apps, status, ou peça ajuda...'),
    ).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<ChatInput value="" onChange={onChange} onSend={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('should disable send button when empty', () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByLabelText('Enviar mensagem')).toBeDisabled();
  });

  it('should enable send button when value is present', () => {
    render(<ChatInput value="hello" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByLabelText('Enviar mensagem')).not.toBeDisabled();
  });

  it('should call onSend when send button clicked', () => {
    const onSend = vi.fn();
    render(<ChatInput value="hello" onChange={vi.fn()} onSend={onSend} />);

    fireEvent.click(screen.getByLabelText('Enviar mensagem'));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('should call onSend on Enter key', () => {
    const onSend = vi.fn();
    render(<ChatInput value="hello" onChange={vi.fn()} onSend={onSend} />);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('should not call onSend on Shift+Enter', () => {
    const onSend = vi.fn();
    render(<ChatInput value="hello" onChange={vi.fn()} onSend={onSend} />);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
