import { Module } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { TypedConfigModule } from '../../config/typed-config.module';

@Module({
  imports: [TypedConfigModule],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
