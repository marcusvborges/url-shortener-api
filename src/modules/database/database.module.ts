import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypedConfigModule } from '../../config/typed-config.module';
import { TypedConfigService } from '../../config/typed-config.service';

@Module({
  imports: [
    TypedConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => {
        const nodeEnv = config.get('NODE_ENV');
        const databaseUrl = config.get('DATABASE_URL');

        return {
          type: 'postgres' as const,

          ...(databaseUrl
            ? {
                url: databaseUrl,
              }
            : {
                host: config.get('DB_HOST'),
                port: config.get('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
              }),

          autoLoadEntities: true,
          synchronize: false,
          logging: nodeEnv !== 'production',
          ssl:
            nodeEnv === 'production'
              ? { rejectUnauthorized: false }
              : undefined,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
