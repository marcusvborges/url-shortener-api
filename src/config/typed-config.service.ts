import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './env.schema';

@Injectable()
export class TypedConfigService {
  constructor(private readonly configService: ConfigService<EnvSchema>) {}

  get<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
    const value = this.configService.get(key, { infer: true });
    if (value === undefined) {
      throw new Error(`Missing environment variable: ${String(key)}`);
    }
    return value as EnvSchema[K];
  }

  getOptional<K extends keyof EnvSchema>(key: K): EnvSchema[K] | undefined {
    return this.configService.get(key, { infer: true });
  }
}
