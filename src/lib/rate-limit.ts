/**
 * In-memory rate limiting for password reset flows.
 * For multi-instance deployments, replace with Redis/Vercel KV.
 */

const entries = new Map<string, { count: number; resetAt: number }>();

const PRUNE_INTERVAL_MS = 60_000;
let lastPrune = Date.now();

function prune() {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, v] of entries.entries()) {
    if (v.resetAt <= now) entries.delete(key);
  }
}

export type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
};

/**
 * Check rate limit for identifier (e.g. IP). Returns true if request is allowed.
 */
export function checkRateLimit(identifier: string, options: RateLimitOptions): boolean {
  prune();
  const { key, windowMs, max } = options;
  const id = `${key}:${identifier}`;
  const now = Date.now();
  const entry = entries.get(id);
  if (!entry) {
    entries.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now >= entry.resetAt) {
    entries.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export const PASSWORD_RESET_LIMITS = {
  requestReset: { key: 'forgot-password', windowMs: 15 * 60 * 1000, max: 3 },
  resetPassword: { key: 'reset-password', windowMs: 15 * 60 * 1000, max: 5 }
} as const;

/** Per-IP rate limits for auth endpoints (signup, etc.). */
export const AUTH_ENDPOINT_LIMITS = {
  signup: { key: 'signup', windowMs: 15 * 60 * 1000, max: 5 }
} as const;
