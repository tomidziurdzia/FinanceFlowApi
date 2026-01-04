import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { AuthController } from './auth.controller';
import { ClerkClientProvider } from '../providers/clerk-client.provider';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [ClerkStrategy, ClerkClientProvider],
  exports: [ClerkStrategy],
})
export class AuthModule {}
