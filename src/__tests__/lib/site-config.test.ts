import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/config/site';

describe('siteConfig', () => {
  it('should have a name', () => {
    expect(siteConfig.name).toBe('CatIA Super App');
  });

  it('should have a description', () => {
    expect(siteConfig.description).toBeTruthy();
  });

  it('should have a url', () => {
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });
});
