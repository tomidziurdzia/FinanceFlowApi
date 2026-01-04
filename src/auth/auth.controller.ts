import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { ClerkJwtPayload } from './decorators/current-user.decorator';
import type { ClerkClient } from '@clerk/backend';

@Controller('auth')
export class AuthController {
  constructor(@Inject('ClerkClient') private clerkClient: ClerkClient) {}

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  getProfile(@CurrentUser() user: ClerkJwtPayload) {
    return {
      userId: user.sub,
    };
  }
}
