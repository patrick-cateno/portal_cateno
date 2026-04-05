import { z } from 'zod';

const ToolDefinitionSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_]+$/, 'Nome deve conter apenas letras minúsculas, números e underscores'),
  description: z.string().min(1).max(500),
  inputSchema: z.record(z.unknown()),
  outputSchema: z.record(z.unknown()).optional(),
  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
  requiredRole: z.string().max(50).nullable().optional(),
});

export const RegisterToolsSchema = z.object({
  applicationSlug: z.string().min(1),
  tools: z.array(ToolDefinitionSchema).min(1).max(50),
});

export type RegisterToolsInput = z.infer<typeof RegisterToolsSchema>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
