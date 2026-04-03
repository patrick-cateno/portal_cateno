import { describe, expect, it } from 'vitest';
import { mainNavItems } from '@/config/navigation';

describe('navigation config', () => {
  it('should have at least one nav item', () => {
    expect(mainNavItems.length).toBeGreaterThan(0);
  });

  it('each item should have required fields', () => {
    for (const item of mainNavItems) {
      expect(item.label).toBeTruthy();
      expect(item.href).toMatch(/^\//);
      expect(item.icon).toBeTruthy();
    }
  });

  it('should include Dashboard, Aplicações and CatIA', () => {
    const labels = mainNavItems.map((i) => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Aplicações');
    expect(labels).toContain('CatIA');
  });
});
