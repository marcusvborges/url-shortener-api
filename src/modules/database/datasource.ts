import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { envSchema } from '../../config/env.schema';

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Invalid env for datasource:\n${JSON.stringify(parsed.error, null, 2)}`,
  );
}

const env = parsed.data;

const AppDataSource = new DataSource({
  type: 'postgres',

  ...(env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
      }),

  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: env.NODE_ENV !== 'production',
  ssl:
    env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export default AppDataSource;
