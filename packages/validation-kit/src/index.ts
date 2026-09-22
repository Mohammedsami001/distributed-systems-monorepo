import { z } from 'zod';

// Re-export zod so consumer services don't need to install it separately
export { z };

/**
 * Standard pagination query parameters schema.
 * Coerces string query parameters like '?page=2&limit=25' into valid numbers.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * Standard UUID v4 validator for IDs across all microservices.
 */
export const uuidSchema = z.string().uuid({ message: 'Invalid UUID v4 identifier' });

/**
 * Schema for rate limiting rules used in Project 1 (API Gateway).
 * Defines the window duration and max allowable requests per client.
 */
export const rateLimitRuleSchema = z.object({
  /** Time window in milliseconds (e.g. 60,000 for 1 minute) */
  windowMs: z.number().int().positive(),
  /** Max requests allowed within the window */
  maxRequests: z.number().int().positive(),
  /** Namespace prefix for Redis keys (e.g. 'rl:public', 'rl:billing') */
  keyPrefix: z.string().min(1).default('rl'),
});

export type RateLimitRule = z.infer<typeof rateLimitRuleSchema>;

/**
 * Helper to safely validate incoming data against any Zod schema.
 * Returns either clean data or an array of human-readable error messages.
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return path ? `Field '${path}': ${err.message}` : err.message;
  });

  return { success: false, errors };
}
