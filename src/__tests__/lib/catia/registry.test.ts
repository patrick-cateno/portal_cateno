import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    microserviceTool: { findMany: vi.fn() },
  },
}));

import { prisma } from '@/lib/db';
import { loadToolsForUser } from '@/lib/catia/tools/registry';

const mockFindMany = vi.mocked(prisma.microserviceTool.findMany);

const mockTools = [
  {
    name: 'consultar_cartao',
    description: 'Consulta dados de um cartão',
    inputSchema: { type: 'object' },
    application: { name: 'Gestão de Cartões' },
  },
];

describe('loadToolsForUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns formatted tools for admin', async () => {
    mockFindMany.mockResolvedValueOnce(mockTools as never);
    const tools = await loadToolsForUser(['admin']);
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('consultar_cartao');
    expect(tools[0].description).toContain('[Gestão de Cartões]');
  });

  it('filters by role for non-admin', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await loadToolsForUser(['user']);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          OR: [{ requiredRole: null }, { requiredRole: { in: ['user'] } }],
        }),
      }),
    );
  });

  it('admin sees all active tools without role filter', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await loadToolsForUser(['admin']);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
      }),
    );
  });
});
