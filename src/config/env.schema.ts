import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3000),

    BASE_URL: z.string().pipe(z.url()),

    DATABASE_URL: z.string().optional(),

    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().optional(),
    DB_USERNAME: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),

    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default('1d'),

    OBSERVABILITY_ENABLED: z.coerce.boolean().default(false),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    SWAGGER_ENABLED: z.coerce.boolean().default(false),
    SWAGGER_PATH: z.string().default('api/docs'),
  })
  .superRefine((env, ctx) => {
    const hasUrl = !!env.DATABASE_URL;
    const hasParts =
      !!env.DB_HOST &&
      env.DB_PORT !== undefined &&
      !!env.DB_USERNAME &&
      !!env.DB_PASSWORD &&
      !!env.DB_NAME;

    if (!hasUrl && !hasParts) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Database config missing: provide DATABASE_URL or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME',
        path: ['DATABASE_URL'],
      });
    }
  });

export type EnvSchema = z.infer<typeof envSchema>;
