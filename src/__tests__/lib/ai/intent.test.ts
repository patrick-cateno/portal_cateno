import { describe, expect, it } from 'vitest';
import { recognizeIntentByRegex } from '@/lib/ai/intent';

describe('recognizeIntentByRegex', () => {
  it('should recognize navigate intent: "abrir cartões"', () => {
    const result = recognizeIntentByRegex('abrir cartões');
    expect(result).toEqual({ type: 'navigate', app: 'cartões' });
  });

  it('should recognize navigate intent: "ir para dashboard"', () => {
    const result = recognizeIntentByRegex('ir para dashboard');
    expect(result).toEqual({ type: 'navigate', app: 'dashboard' });
  });

  it('should recognize navigate intent: "acessar processamento"', () => {
    const result = recognizeIntentByRegex('acessar processamento');
    expect(result).toEqual({ type: 'navigate', app: 'processamento' });
  });

  it('should recognize status intent: "como está cartões?"', () => {
    const result = recognizeIntentByRegex('como está cartões?');
    expect(result).toEqual({ type: 'query_status', app: 'cartões' });
  });

  it('should recognize status intent: "status de processamento"', () => {
    const result = recognizeIntentByRegex('status de processamento');
    expect(result).toEqual({ type: 'query_status', app: 'processamento' });
  });

  it('should recognize search intent: "quais apps de operações?"', () => {
    const result = recognizeIntentByRegex('quais apps de operações?');
    expect(result).toEqual({ type: 'search', query: 'operações' });
  });

  it('should recognize search intent: "listar aplicações de compliance"', () => {
    const result = recognizeIntentByRegex('listar aplicações de compliance');
    expect(result).toEqual({ type: 'search', query: 'compliance' });
  });

  it('should recognize help intent: "ajuda"', () => {
    const result = recognizeIntentByRegex('ajuda');
    expect(result).toEqual({ type: 'help' });
  });

  it('should recognize help intent: "como usar"', () => {
    const result = recognizeIntentByRegex('como usar');
    expect(result).toEqual({ type: 'help' });
  });

  it('should recognize help intent: "o que você faz"', () => {
    const result = recognizeIntentByRegex('o que você faz');
    expect(result).toEqual({ type: 'help' });
  });

  it('should return null for unrecognized input', () => {
    const result = recognizeIntentByRegex('bom dia');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = recognizeIntentByRegex('');
    expect(result).toBeNull();
  });
});
