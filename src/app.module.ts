import { Module } from '@nestjs/common';
import { TypedConfigModule } from './config/typed-config.module';
import { ShortUrlModule } from './modules/short-url/short-url.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [TypedConfigModule, DatabaseModule, ShortUrlModule],
})
export class AppModule {}
