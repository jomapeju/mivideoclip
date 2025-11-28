/* eslint-disable */
import { Injectable } from "@nestjs/common";

@Injectable()
export class RateLimitService {
  private requests = new Map<string, { count: number; lastAttempt: number; penalty: number }>();

  private MAX_REQUESTS = 10;             // 10 por minuto
  private WINDOW_MS = 60 * 1000;         // 1 minuto
  private PENALTY_STEP = 5000;           // 5 segundos por intento bloqueado adicional
  private MAX_PENALTY = 60000;           // máximo 60 segundos

  check(ip: string) {
    const now = Date.now();
    const data = this.requests.get(ip);

    if (!data) {
      this.requests.set(ip, { count: 1, lastAttempt: now, penalty: 0 });
      return { allowed: true };
    }

    const { count, lastAttempt, penalty } = data;

    // reset si pasó el minuto
    if (now - lastAttempt > this.WINDOW_MS) {
      this.requests.set(ip, { count: 1, lastAttempt: now, penalty: 0 });
      return { allowed: true };
    }

    // si excedió requests → aplicar bloqueo progresivo
    if (count >= this.MAX_REQUESTS) {
      const newPenalty = Math.min(penalty + this.PENALTY_STEP, this.MAX_PENALTY);
      this.requests.set(ip, { count, lastAttempt: now, penalty: newPenalty });

      return {
        allowed: false,
        retryAfter: newPenalty,
      };
    }

    // incrementar contador
    this.requests.set(ip, { count: count + 1, lastAttempt: now, penalty });

    return { allowed: true };
  }
}
