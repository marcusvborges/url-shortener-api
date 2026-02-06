import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return req.user;
  },
);
