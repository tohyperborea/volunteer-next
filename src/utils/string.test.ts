import { isValidEmail } from './string';

describe('isValidEmail', () => {
  it('should return true for a valid email address', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should return false for an email without "@" symbol', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('should return false for an email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('should return false for an email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should return false for a string longer than 254 characters', () => {
    const longEmail = 'a'.repeat(255) + '@example.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it('should return false for non-string input', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });

  it('should return true for an email with valid subdomains', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('should return false for an email with invalid characters', () => {
    expect(isValidEmail('test@exa!mple.com')).toBe(false);
  });

  it('should trim whitespace and validate correctly', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true);
  });
});
