/* eslint-disable */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException, 
  HttpStatus,
} from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { generateFingerprint } from '../fingerprint/fingerprint.util';

function getIp(req: any): string {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    req.ip ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

/**
 * Limita comentarios para evitar spam:
 * - 20 comentarios/hora por fingerprint
 * - 10 comentarios/hora por usuario
 * - 5 comentarios/hora por video+usuario (extra)
 */
@Injectable()
export class CommentRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimit: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<any>();

    const userId = req.user?.user_id || req.user?.id || 'anon';
    const videoId = req.params.id || 'unknown';
    const fp = generateFingerprint(req);
    const ip = getIp(req);

    // 1) Límite global por fingerprint
    const fpKey = `comment:fp:${fp}`;
    const fpAllowed = await this.rateLimit.consume(fpKey, 20, 60 * 60); // 20/h

    if (!fpAllowed) {
      throw new HttpException(
        'Has enviado demasiados comentarios desde este dispositivo. Inténtalo más tarde.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 2) Límite global por usuario
    const userKey = `comment:user:${userId}`;
    const userAllowed = await this.rateLimit.consume(userKey, 10, 60 * 60); // 10/h

    if (!userAllowed) {
      throw new HttpException(
        'Has enviado demasiados comentarios en la última hora.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 3) Límite por vídeo + usuario
    const perVideoKey = `comment:user:${userId}:video:${videoId}`;
    const perVideoAllowed = await this.rateLimit.consume(
      perVideoKey,
      5,
      60 * 60, // 5/h por vídeo
    );

    if (!perVideoAllowed) {
      throw new HttpException(
        'Has comentado demasiadas veces este vídeo en la última hora.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 4) Opcional: límite por IP (por si quieres añadirlo)
    const ipKey = `comment:ip:${ip}`;
    const ipAllowed = await this.rateLimit.consume(ipKey, 50, 60 * 60); // 50/h

    if (!ipAllowed) {
      throw new HttpException(
        'Se han detectado demasiados comentarios desde esta IP.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
