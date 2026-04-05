import { z } from 'zod';

/** Zod schema for POST /api/applications body */
export const CreateApplicationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hífens',
    ),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  categoryId: z.string().min(1),
  url: z.string().url().optional(),
  healthCheckUrl: z.string().url().optional(),
  integrationType: z.enum(['redirect', 'embed', 'modal']).default('redirect'),
  order: z.number().int().min(0).default(0),
});

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;

/** Zod schema for PATCH /api/applications/[slug]/health body */
export const HealthUpdateSchema = z.object({
  status: z.enum(['online', 'maintenance', 'offline']),
  response_time_ms: z.number().int().nullable().optional(),
  uptime_pct: z.number().min(0).max(100).nullable().optional(),
  error_message: z.string().nullable().optional(),
});

export type HealthUpdateInput = z.infer<typeof HealthUpdateSchema>;
