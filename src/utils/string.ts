/**
 * String utilities.
 * @since 2026-03-22
 * @author Michael Townsend <@continuities>
 */

export const EMAIL_PATTERN = '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}';
const EMAIL_REGEX = new RegExp(`^${EMAIL_PATTERN}$`);

/**
 * Validates whether a string is a properly formatted email address
 * @param email A string to validate as an email address
 * @returns true if the string is a valid email address, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}
