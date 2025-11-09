import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config();

// Define la interfaz del payload que esperamos del token
interface JwtPayload {
  username: string;
  sub: string; // user_id
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Dónde buscar el JWT: del encabezado de Autorización (Bearer token)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Si el token expiró, Passport lo manejará por nosotros
      ignoreExpiration: false,
      // 3. Clave secreta para verificar la firma
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Método de validación: Se ejecuta si el token es válido y no ha expirado.
   * @param payload Los datos decodificados del token.
   * @returns Los datos del usuario que se inyectarán en req.user.
   */
  async validate(payload: JwtPayload) {
    // TODO: En una aplicación real, harías una consulta a la DB para asegurar que el
    // usuario (payload.sub) aún existe. Por ahora, devolvemos el payload.
    return {
      user_id: payload.sub,
      username: payload.username
    };
  }
}