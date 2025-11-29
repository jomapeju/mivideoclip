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
 * Limita votos en concursos:
 * - 15 votos / hora por fingerprint
 * - 30 votos / hora por IP
 * Ojo: la restricción "1 voto por concurso y video" ya la hace el servicio/DB.
 */
@Injectable()
export class ContestVoteGuard implements CanActivate {
  constructor(private readonly rateLimit: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<any>();

    const userId = req.user?.user_id || req.user?.id || 'anon';
    const contestId = req.params.id || 'unknown';
    const fp = generateFingerprint(req);
    const ip = getIp(req);

    // 1) Límite por fingerprint
    const fpKey = `contest_vote:fp:${contestId}:${fp}`;
    const fpAllowed = await this.rateLimit.consume(fpKey, 15, 60 * 60); // 15/h

    if (!fpAllowed) {
      throw new HttpException(
        'Has alcanzado el límite de votos desde este dispositivo. Inténtalo de nuevo más tarde.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // 2) Límite por IP
    const ipKey = `contest_vote:ip:${contestId}:${ip}`;
    const ipAllowed = await this.rateLimit.consume(ipKey, 30, 60 * 60); // 30/h

    if (!ipAllowed) {
      throw new HttpException(
        'Se han detectado demasiados votos desde esta IP. Inténtalo de nuevo más tarde.', HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Usuario queda registrado indirectamente en el vote service/DB
    return true;
  }
}
