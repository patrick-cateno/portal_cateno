import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should debounce value updates', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'hello', delay: 300 },
    });

    rerender({ value: 'world', delay: 300 });
    expect(result.current).toBe('hello'); // Not yet updated

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('world'); // Now updated

    vi.useRealTimers();
  });

  it('should only emit final value after rapid changes', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    });

    rerender({ value: 'ab', delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'abc', delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'abcd', delay: 300 });
    expect(result.current).toBe('a'); // Still initial

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('abcd'); // Only final value

    vi.useRealTimers();
  });
});
