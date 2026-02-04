import { Module } from '@nestjs/common';
import { TypedConfigModule } from './config/typed-config.module';

@Module({
  imports: [
    TypedConfigModule,
  ],
})
export class AppModule {}
