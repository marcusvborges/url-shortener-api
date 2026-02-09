import { Module } from '@nestjs/common';
import { TypedConfigModule } from './config/typed-config.module';
import { ShortUrlModule } from './modules/short-url/short-url.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { HashModule } from './modules/hash/hash.module';
import { ObservabilityService } from './common/observability/observability.service';

@Module({
  imports: [
    TypedConfigModule,
    DatabaseModule,
    ShortUrlModule,
    UserModule,
    AuthModule,
    HashModule,
  ],
  providers: [ObservabilityService],
})
export class AppModule {}
