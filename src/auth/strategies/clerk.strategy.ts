import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import type { ClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    private configService: ConfigService,
    @Inject('ClerkClient') private clerkClient: ClerkClient,
  ) {
    super();
  }

  async validate(request: Request): Promise<unknown> {
    const token = this.extractTokenFromHeader(request);
    const userId = request.headers['x-user-id'] as string;

    let clerkUserId: string | undefined;

    // Si hay token, intentar verificar y extraer userId
    if (token) {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (secretKey) {
        try {
          const result = await verifyToken(token, { secretKey });
          if (!result.errors && result.data) {
            clerkUserId = (result.data as { sub?: string }).sub;
          }
        } catch {
          // Si falla la verificación, continuar con userId del header
        }
      }
    }

    // Si no hay userId del token, usar el del header
    if (!clerkUserId && userId) {
      clerkUserId = userId;
    }

    // Si tenemos userId, obtener datos del usuario y retornar formato consistente
    if (clerkUserId) {
      try {
        const user = await this.clerkClient.users.getUser(clerkUserId);
        return {
          sub: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          session_id: user.id,
        };
      } catch {
        throw new UnauthorizedException('Invalid user ID');
      }
    }

    throw new UnauthorizedException('Token or user ID required');
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
