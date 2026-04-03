import { describe, expect, it } from 'vitest';
import { mainNavItems, sidebarNavItems, breadcrumbLabels } from '@/config/navigation';

describe('navigation config', () => {
  describe('mainNavItems', () => {
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

    it('should include Aplicacoes and CatIA', () => {
      const labels = mainNavItems.map((i) => i.label);
      expect(labels).toContain('Aplicacoes');
      expect(labels).toContain('CatIA');
    });
  });

  describe('sidebarNavItems', () => {
    it('should include Inicio, Favoritos, Suporte, Admin', () => {
      const labels = sidebarNavItems.map((i) => i.label);
      expect(labels).toContain('Inicio');
      expect(labels).toContain('Favoritos');
      expect(labels).toContain('Suporte');
      expect(labels).toContain('Admin');
    });

    it('Admin should require admin role', () => {
      const admin = sidebarNavItems.find((i) => i.label === 'Admin');
      expect(admin?.roles).toContain('admin');
      expect(admin?.roles).not.toContain('user');
    });
  });

  describe('breadcrumbLabels', () => {
    it('should map common segments', () => {
      expect(breadcrumbLabels.aplicacoes).toBe('Aplicacoes');
      expect(breadcrumbLabels.catia).toBe('CatIA');
      expect(breadcrumbLabels.inicio).toBe('Inicio');
    });
  });
});
