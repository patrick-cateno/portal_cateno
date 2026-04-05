import { z } from 'zod';

/**
 * Zod schema for validating $queryRaw results from the
 * LATERAL JOIN status query (GET /api/applications/status).
 *
 * Per PC-SPEC-008 Ajuste 1: never use type assertion on raw queries.
 */
export const AppStatusSchema = z.array(
  z.object({
    slug: z.string(),
    status: z.enum(['online', 'maintenance', 'offline']),
    response_time_ms: z.number().nullable(),
  }),
);

export type AppStatusRow = z.infer<typeof AppStatusSchema>[number];
