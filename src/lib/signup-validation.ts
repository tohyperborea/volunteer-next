/**
 * Server-side validation for sign-up and safe redirect URL handling.
 * Used to prevent invalid input and open redirect vulnerabilities.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 255;
/** Disallow control chars, leading/trailing spaces already trimmed by caller */
const NAME_SAFE_REGEX = /^[\p{L}\p{N}\p{P}\p{Z}\p{S}]*$/u;

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}

export interface PasswordValidation {
  valid: boolean;
  error?: 'too_short' | 'too_weak';
}

export function validatePassword(password: string): PasswordValidation {
  if (typeof password !== 'string') {
    return { valid: false, error: 'too_short' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: 'too_short' };
  }
  const hasLetter = /\p{L}/u.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'too_weak' };
  }
  return { valid: true };
}

export interface NameValidation {
  valid: boolean;
  error?: 'empty' | 'too_long' | 'invalid_chars';
}

export function validateName(name: string): NameValidation {
  if (typeof name !== 'string') {
    return { valid: false, error: 'empty' };
  }
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN_LENGTH) {
    return { valid: false, error: 'empty' };
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return { valid: false, error: 'too_long' };
  }
  if (!NAME_SAFE_REGEX.test(trimmed)) {
    return { valid: false, error: 'invalid_chars' };
  }
  return { valid: true };
}

/**
 * Returns a safe redirect URL. Prevents open redirect by allowing only
 * relative paths (single leading /, no protocol, no //).
 */
export function getSafeCallbackUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== 'string') return '/';
  const u = url.trim();
  if (u === '') return '/';
  if (u.startsWith('//') || u.includes('://') || /[\0\\]/.test(u)) return '/';
  return u.startsWith('/') ? u : `/${u}`;
}
