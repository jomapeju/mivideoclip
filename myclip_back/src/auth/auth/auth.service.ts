/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  async generateTokens(userId: string) {
    const accessExp = Number(this.config.get('JWT_ACCESS_EXP')) || 900; // 15m
    const refreshExp = Number(this.config.get('JWT_REFRESH_EXP')) || 604800; // 7d

    const accessToken = this.jwt.sign(
      { userId },
      { expiresIn: accessExp },
    );

    const refreshToken = this.jwt.sign(
      { userId },
      {
        expiresIn: refreshExp,
        secret: this.config.get('JWT_REFRESH_SECRET'),
      },
    );

    return {
      accessToken,
      refreshToken,
      accessExp,
      refreshExp,
    };
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);

    const tokens = await this.generateTokens(user.user_id);

    return {
      user,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload: any = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const tokens = await this.generateTokens(user.user_id);

      return {
        user,
        ...tokens,
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
