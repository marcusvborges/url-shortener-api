import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { envSchema } from './env.schema';
import { TypedConfigService } from './typed-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (env) => {
        const result = envSchema.safeParse(env);
        if (!result.success) {
          const formatted = z.prettifyError(result.error);
          throw new Error(`Invalid environment variables:\n${formatted}`);
        }
        return result.data;
      },
    }),
  ],
  providers: [TypedConfigService],
  exports: [NestConfigModule, TypedConfigService],
})
export class TypedConfigModule {}
