import { Injectable, Logger } from '@nestjs/common';
import { TypedConfigService } from '../../config/typed-config.service';

type AppLogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<AppLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

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

  private shouldLog(level: AppLogLevel): boolean {
    if (!this.enabled()) return false;
    const current = LEVEL_WEIGHT[this.level()];
    return LEVEL_WEIGHT[level] >= current;
  }

  log(message: string) {
    if (!this.shouldLog('info')) return;
    this.logger.log(message);
  }

  warn(message: string) {
    if (!this.shouldLog('warn')) return;
    this.logger.warn(message);
  }

  error(message: string, trace?: string) {
    if (!this.shouldLog('error')) return;
    this.logger.error(message, trace);
  }

  debug(message: string) {
    if (!this.shouldLog('debug')) return;
    this.logger.debug(message);
  }
}
