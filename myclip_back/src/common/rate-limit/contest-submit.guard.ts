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
 * Limita inscripciones de vídeos en concursos:
 * - 10 inscripciones/hora por fingerprint
 * - 5 inscripciones/hora por usuario (en todos los concursos)
 * La lógica de "este vídeo ya está inscrito" se maneja en ContestService.
 */
@Injectable()
export class ContestSubmitGuard implements CanActivate {
  constructor(private readonly rateLimit: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<any>();

    const userId = req.user?.user_id || req.user?.id || 'anon';
    const contestId = req.params.id || 'unknown';
    const fp = generateFingerprint(req);
    const ip = getIp(req);

    // 1) Límite por fingerprint (por concurso)
    const fpKey = `contest_submit:fp:${contestId}:${fp}`;
    const fpAllowed = await this.rateLimit.consume(fpKey, 10, 60 * 60); // 10/h

    if (!fpAllowed) {
      throw new HttpException(
        'Has alcanzado el límite de inscripciones desde este dispositivo para este concurso.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 2) Límite por usuario (global en concursos)
    const userKey = `contest_submit:user:${userId}`;
    const userAllowed = await this.rateLimit.consume(userKey, 5, 60 * 60); // 5/h

    if (!userAllowed) {
      throw new HttpException(
        'Has inscrito demasiados vídeos en concursos en la última hora.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 3) Opcional: IP global para inscripciones
    const ipKey = `contest_submit:ip:${ip}`;
    const ipAllowed = await this.rateLimit.consume(ipKey, 30, 60 * 60); // 30/h

    if (!ipAllowed) {
      throw new HttpException(
        'Se han detectado demasiadas inscripciones desde esta IP. Inténtalo más tarde.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
