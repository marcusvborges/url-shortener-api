import { Injectable, Logger } from '@nestjs/common';
import { TypedConfigService } from '../../config/typed-config.service';

type AppLogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger('Observability');

  constructor(private readonly config: TypedConfigService) {}

  private enabled(): boolean {
    return this.config.get('OBSERVABILITY_ENABLED') === true;
  }

  private level(): AppLogLevel {
    return this.config.get('LOG_LEVEL');
  }

  log(message: string) {
    if (!this.enabled()) return;
    if (this.level() === 'error') return;
    this.logger.log(message);
  }

  warn(message: string) {
    if (!this.enabled()) return;
    if (this.level() === 'error') return;
    this.logger.warn(message);
  }

  error(message: string, trace?: string) {
    if (!this.enabled()) return;
    this.logger.error(message, trace);
  }

  debug(message: string) {
    if (!this.enabled()) return;
    if (this.level() !== 'debug') return;
    this.logger.debug(message);
  }
}
