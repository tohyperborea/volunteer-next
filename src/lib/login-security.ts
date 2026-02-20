/**
 * Login lockout and security logging for credentials sign-in.
 * - Tracks failed attempts per email; locks after N failures for a period.
 * - Logs failed attempts for security monitoring (never logs passwords or raw error messages).
 * In-memory store; for multi-instance deployments use Redis or similar.
 */

import { checkRateLimit } from './rate-limit';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const PRUNE_INTERVAL_MS = 60_000;

export const SIGNIN_RATE_LIMITS = {
  /** Per-IP rate limit for sign-in attempts (any email). */
  byIp: { key: 'signin-ip', windowMs: 15 * 60 * 1000, max: 20 }
} as const;

type LockoutEntry = { failedCount: number; lockedUntil: number };

const lockoutByEmail = new Map<string, LockoutEntry>();
let lastPrune = Date.now();

function pruneLockouts() {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, v] of lockoutByEmail.entries()) {
    if (v.lockedUntil <= now) lockoutByEmail.delete(key);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Returns true if this email is allowed to attempt sign-in (not locked).
 */
export function checkLoginLockout(email: string): boolean {
  pruneLockouts();
  const key = normalizeEmail(email);
  const entry = lockoutByEmail.get(key);
  if (!entry) return true;
  if (Date.now() >= entry.lockedUntil) {
    lockoutByEmail.delete(key);
    return true;
  }
  return false;
}

/**
 * Record a failed sign-in attempt. Call only for actual auth failures (invalid credentials).
 * Logs for security monitoring; never logs password or raw error message.
 */
export function recordFailedLogin(email: string, ip: string | null): void {
  pruneLockouts();
  const key = normalizeEmail(email);
  const now = Date.now();
  const entry = lockoutByEmail.get(key);
  if (!entry) {
    lockoutByEmail.set(key, {
      failedCount: 1,
      lockedUntil: 0
    });
  } else if (entry.lockedUntil <= now) {
    entry.failedCount += 1;
    entry.lockedUntil = 0;
  }
  const current = lockoutByEmail.get(key)!;
  if (current.failedCount >= LOCKOUT_THRESHOLD) {
    current.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  logFailedAttempt(key, ip);
}

/**
 * Clear failed-attempt state after successful sign-in.
 */
export function recordSuccessfulLogin(email: string): void {
  lockoutByEmail.delete(normalizeEmail(email));
}

/**
 * Security log for failed sign-in attempts.
 * Must never log: password, raw error message, or stack traces from auth errors.
 */
function logFailedAttempt(email: string, ip: string | null): void {
  const ipPart = ip ?? 'unknown';
  // eslint-disable-next-line no-console
  console.warn('[auth] Failed sign-in attempt', { email, ip: ipPart });
}

/**
 * Returns true if the IP is within sign-in rate limits.
 */
export function checkSignInRateLimit(ip: string): boolean {
  return checkRateLimit(ip, SIGNIN_RATE_LIMITS.byIp);
}
