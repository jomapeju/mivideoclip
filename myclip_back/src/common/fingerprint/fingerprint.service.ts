/* eslint-disable */
import { Injectable } from '@nestjs/common';

/**
 * FingerprintService
 *
 * Implementación simple en memoria para contar eventos por fingerprint.
 * Más adelante se puede cambiar a Redis sin tocar el resto del código.
 */
@Injectable()
export class FingerprintService {
  // Mapa: fp -> { count, expiresAt }
  private store = new Map<string, { count: number; expiresAt: number }>();

  private TTL_MS = 60 * 60 * 1000; // 1 hora

  /**
   * Incrementa el contador para un fingerprint y lo mantiene durante TTL_MS.
   * Devuelve el valor actualizado.
   */
  async record(fp: string): Promise<number> {
    const now = Date.now();
    const current = this.store.get(fp);

    if (!current || current.expiresAt < now) {
      // Reiniciar ventana
      const entry = { count: 1, expiresAt: now + this.TTL_MS };
      this.store.set(fp, entry);
      return 1;
    }

    current.count += 1;
    this.store.set(fp, current);
    return current.count;
  }

  /**
   * Obtiene el número de eventos recientes para ese fingerprint.
   */
  async getCount(fp: string): Promise<number> {
    const now = Date.now();
    const current = this.store.get(fp);
    if (!current || current.expiresAt < now) {
      return 0;
    }
    return current.count;
  }
}
