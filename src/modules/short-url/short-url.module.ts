import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { RedirectController } from './redirect.controller.ts.controller';
import { ObservabilityModule } from '../../common/observability/observability.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrl]), ObservabilityModule],
  controllers: [ShortUrlController, RedirectController],
  providers: [ShortUrlService],
})
export class ShortUrlModule {}
