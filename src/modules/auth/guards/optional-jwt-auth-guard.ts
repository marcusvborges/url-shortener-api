import { Injectable, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

type CanActivateResult = boolean | Promise<boolean> | Observable<boolean>;

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext): CanActivateResult {
    const req = context
      .switchToHttp()
      .getRequest<{ headers?: { authorization?: string } }>();

    if (!req.headers?.authorization) return true;

    return super.canActivate(context) as CanActivateResult;
  }
}
