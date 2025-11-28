/* eslint-disable */
import {
  Controller,
  Post,
  Get,
  Patch,
  Req,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import axios from 'axios';

import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthService } from './auth.service';

import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { generateFingerprint } from '../../common/fingerprint/fingerprint.util';
import { EmailVerificationService } from '../email-verification.service';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../cookie.constants';
import { EmailService } from './email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // ==========================
  //   REGISTER (con reCAPTCHA + fingerprint + email verification)
  // ==========================
  @UseGuards(RateLimitGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateUserDto,
  ) {
    // 1. Validar reCAPTCHA
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.warn(
        '[WARN] RECAPTCHA_SECRET_KEY no está definido. reCAPTCHA se omite en entorno local.',
      );
    }

    if (secret) {
      const token = (dto as any).recaptchaToken;
      if (!token) {
        throw new BadRequestException('Falta el token de reCAPTCHA.');
      }

      const googleRes = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: secret,
            response: token,
          },
        },
      );

      if (!googleRes.data.success || googleRes.data.score < 0.5) {
        throw new BadRequestException('No se pudo verificar que eres humano.');
      }
    }

    // 2. Generar fingerprint y guardarlo en cookie HttpOnly (para posibles futuros usos antifraude)
    const fp = generateFingerprint(req);
    res.cookie('fingerprint_id', fp, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutos
      path: '/',
    });

    // 3. Registrar usuario (sin recaptchaToken)
    const { recaptchaToken, ...cleanDto } = dto as any;
    const user = await this.usersService.registerUser(cleanDto);

    // 4. Generar token de verificación de email y "enviar" correo
    const token = await this.emailVerificationService.generate(user.user_id || user.id);
    await this.emailVerificationService.sendVerificationEmail(user.email, token);

    return {
      user,
      message:
        'Usuario registrado. Revisa tu correo para activar la cuenta.',
    };
  }


  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resend(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Usuario no encontrado.');

    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado.');
    }

    // Generar nuevo token
    const token = await this.emailService.generateVerificationToken(user.user_id);

    // Reenviar correo
    await this.emailService.sendVerificationEmail(user.email, token);

    return { message: 'Correo reenviado. Revisa tu bandeja de entrada.' };
  }

  // ==========================
  //   VERIFY EMAIL
  // ==========================
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Falta token de verificación.');
    }

    const userId = await this.emailVerificationService.validate(token);
    if (!userId) {
      throw new BadRequestException('Token inválido o caducado.');
    }

    await this.usersService.markEmailVerified(userId);

    return { message: 'Email verificado correctamente. Ya puedes iniciar sesión.' };
  }


  // ==========================
  //   ELIMINAR PARA PROD!!!! ENDPOINT ADMIN TEMPORAL — VERIFICAR EMAIL POR CORREO
  // ==========================

@Patch('verify-email/manual')
@HttpCode(HttpStatus.OK)
async verifyEmailManual(@Body() body: { email: string }) {
  if (!body.email) {
    throw new BadRequestException("Email is required");
  }

  // Buscar usuario
  const user = await this.usersService.findByEmail(body.email);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  // Marcar como verificado
  await this.usersService.markEmailVerified(user.user_id);

  return { message: `Email ${body.email} marked as verified` };
}


  // ==========================
  //   LOGIN (rate limited)
  // ==========================
  @UseGuards(RateLimitGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken, accessExp, refreshExp } =
      await this.authService.login(dto.email, dto.password);

    this.setCookies(res, accessToken, refreshToken, accessExp, refreshExp);

    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Res({ passthrough: true }) res: Response) {
    const refresh = res.req.cookies[REFRESH_TOKEN_COOKIE];
    const { user, accessToken, refreshToken, accessExp, refreshExp } =
      await this.authService.refreshTokens(refresh);

    this.setCookies(res, accessToken, refreshToken, accessExp, refreshExp);

    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return { message: 'Logged out' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req) {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) return { user: null };

    const user = await this.usersService.findById(userId);
    return { user };
  }

  private setCookies(
    res: Response,
    access: string,
    refresh: string,
    accessExp: number,
    refreshExp: number,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie(ACCESS_TOKEN_COOKIE, access, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: accessExp * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: refreshExp * 1000,
      path: '/',
    });
  }
}
