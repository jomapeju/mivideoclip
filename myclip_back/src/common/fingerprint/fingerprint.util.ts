/* eslint-disable */
import { randomBytes } from 'crypto';

export function generateFingerprint(req: any): string {
  const ip =
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    'unknown-ip';

  const ua = req.headers['user-agent'] || 'unknown-ua';
  const rand = randomBytes(16).toString('hex');

  return `${ip}|${ua}|${rand}`;
}

