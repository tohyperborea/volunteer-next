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

type RateLimitOptions = {
  key: string; // logical prefix for this limiter, used in the in-memory key
  windowMs: number; // rolling time window for counting attempts (in milliseconds)
  max: number; // maximum allowed attempts within the time window
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
  if (!entry || now >= entry.resetAt) {
    entries.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export const PASSWORD_RESET_LIMITS = {
  requestReset: {
    key: 'forgot-password',
    windowMs: process.env.RESET_PASSWORD_WINDOW_MS
      ? parseInt(process.env.RESET_PASSWORD_WINDOW_MS)
      : 15 * 60 * 1000,
    max: process.env.RESET_PASSWORD_MAX_ATTEMPTS
      ? parseInt(process.env.RESET_PASSWORD_MAX_ATTEMPTS)
      : 3
  },
  resetPassword: {
    key: 'reset-password',
    windowMs: process.env.RESET_PASSWORD_WINDOW_MS
      ? parseInt(process.env.RESET_PASSWORD_WINDOW_MS)
      : 15 * 60 * 1000,
    max: process.env.RESET_PASSWORD_MAX_ATTEMPTS
      ? parseInt(process.env.RESET_PASSWORD_MAX_ATTEMPTS)
      : 5
  }
} as const;

/** Per-IP rate limits for auth endpoints (signup, etc.). */
export const AUTH_ENDPOINT_LIMITS = {
  signup: {
    key: 'signup',
    windowMs: process.env.SIGNUP_WINDOW_MS
      ? parseInt(process.env.SIGNUP_WINDOW_MS)
      : 15 * 60 * 1000,
    max: process.env.SIGNUP_MAX_ATTEMPTS ? parseInt(process.env.SIGNUP_MAX_ATTEMPTS) : 5
  }
} as const;
