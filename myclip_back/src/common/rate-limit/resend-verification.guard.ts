/* eslint-disable */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException, HttpStatus,
} from '@nestjs/common';

const emailCooldownMap = new Map<string, number>(); // email → timestamp ms

@Injectable()
export class ResendVerificationGuard implements CanActivate {
  private COOLDOWN = 5 * 60 * 1000; // 5 minutos

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const email = req.body?.email?.toLowerCase();

    if (!email) return true;

    const now = Date.now();
    const lastTime = emailCooldownMap.get(email);

    if (lastTime && now - lastTime < this.COOLDOWN) {
      const secs = Math.ceil((this.COOLDOWN - (now - lastTime)) / 1000);
      throw new HttpException(
        `Debes esperar ${secs} segundos para pedir otro correo.`, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Registrar tiempo del nuevo intento
    emailCooldownMap.set(email, now);

    return true;
  }
}
