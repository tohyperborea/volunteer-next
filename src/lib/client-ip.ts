import { headers } from 'next/headers';

/**
 * Best-effort client IP from request headers (for rate limiting / logging).
 * Trust your proxy to set the right header (e.g. x-forwarded-for, x-real-ip, cf-connecting-ip).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = h.get('x-real-ip');
  if (real) return real.trim();
  const cf = h.get('cf-connecting-ip');
  if (cf) return cf.trim();
  return 'unknown';
}
