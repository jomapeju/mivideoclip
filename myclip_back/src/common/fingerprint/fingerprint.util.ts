/* eslint-disable */
import { createHash } from 'crypto';

/**
 * Genera una huella (fingerprint) basada en:
 *  - IP (x-forwarded-for o remoteAddress)
 *  - User-Agent
 *  - Accept-Language
 *
 * Resultado: hash SHA-256 estable por dispositivo/navegador.
 */
export function generateFingerprint(req: any): string {
  const ip =
    (req.headers['x-forwarded-for']?.split(',')[0] ?? '').trim() ||
    req.connection?.remoteAddress ||
    req.ip ||
    'unknown_ip';

  const ua = req.headers['user-agent'] || 'unknown_ua';
  const lang = req.headers['accept-language'] || 'unknown_lang';

  const raw = `${ip}|${ua}|${lang}`;

  return createHash('sha256').update(raw).digest('hex');
}
