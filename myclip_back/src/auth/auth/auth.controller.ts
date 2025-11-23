/* eslint-disable */
import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthService } from './auth.service';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../cookie.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.registerUser(dto);
  }

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
