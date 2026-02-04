import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  BASE_URL: z.string().pipe(z.url()),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('1d'),

  OBSERVABILITY_ENABLED: z.coerce.boolean().default(false),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvSchema = z.infer<typeof envSchema>;
