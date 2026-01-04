import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface ClerkJwtPayload {
  sub: string; // user_id de Clerk
  session_id?: string;
  email?: string;
  [key: string]: unknown;
}

export interface RequestWithUser extends Request {
  user?: ClerkJwtPayload;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClerkJwtPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as ClerkJwtPayload;
  },
);
