/* eslint-disable */
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthService } from './auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email-token.entity';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from './auth/email.service';
import { RateLimitService } from '../common/rate-limit/rate-limit.service';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { ResendVerificationGuard } from '../common/rate-limit/resend-verification.guard';
import { EmailWebhookController } from './email-webhook.controller';
import { FingerprintService } from '../common/fingerprint/fingerprint.service';
import { AdminGuard } from './admin.guard'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    forwardRef(() => UsersModule),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    TypeOrmModule.forFeature([EmailVerificationToken]),
  ],

  controllers: [AuthController, EmailWebhookController],

  providers: [
    JwtStrategy,
    AuthService,
    EmailService,
    EmailVerificationService,
    RateLimitService,
    RateLimitGuard,
    ResendVerificationGuard,
    FingerprintService,
    AdminGuard,              
  ],

  exports: [JwtStrategy, PassportModule, JwtModule, AdminGuard], 
})
export class AuthModule {}
