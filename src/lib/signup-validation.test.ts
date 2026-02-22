import { isValidEmail, validatePassword, validateName, getSafeCallbackUrl } from './signup-validation';

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('Ab1').valid).toBe(false);
    expect(validatePassword('Ab1').error).toBe('too_short');
    expect(validatePassword('Ab1234').valid).toBe(false);
  });

  it('rejects passwords with no letters', () => {
    expect(validatePassword('12345678').valid).toBe(false);
    expect(validatePassword('12345678').error).toBe('too_weak');
  });

  it('rejects passwords with no numbers', () => {
    expect(validatePassword('abcdefgh').valid).toBe(false);
    expect(validatePassword('abcdefgh').error).toBe('too_weak');
  });

  it('accepts passwords meeting complexity requirements (min 8 chars, letter+number)', () => {
    expect(validatePassword('Password1').valid).toBe(true);
    expect(validatePassword('abc12345').valid).toBe(true);
    expect(validatePassword('aB3!aB3!').valid).toBe(true);
  });

  it('rejects non-string input', () => {
    expect(validatePassword(null as unknown as string).valid).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });
});

describe('validateName', () => {
  it('accepts valid names', () => {
    expect(validateName('Alice').valid).toBe(true);
    expect(validateName('Héloïse').valid).toBe(true);
  });

  it('rejects empty name', () => {
    expect(validateName('').valid).toBe(false);
    expect(validateName('').error).toBe('empty');
  });

  it('rejects names that are too long', () => {
    expect(validateName('a'.repeat(256)).valid).toBe(false);
    expect(validateName('a'.repeat(256)).error).toBe('too_long');
  });
});

describe('getSafeCallbackUrl', () => {
  it('returns / for null or empty input', () => {
    expect(getSafeCallbackUrl(null)).toBe('/');
    expect(getSafeCallbackUrl('')).toBe('/');
    expect(getSafeCallbackUrl(undefined)).toBe('/');
  });

  it('blocks open redirect via protocol', () => {
    expect(getSafeCallbackUrl('http://evil.com')).toBe('/');
    expect(getSafeCallbackUrl('//evil.com')).toBe('/');
  });

  it('allows safe relative paths', () => {
    expect(getSafeCallbackUrl('/dashboard')).toBe('/dashboard');
    expect(getSafeCallbackUrl('/event/123')).toBe('/event/123');
  });

  it('prepends / to paths missing it', () => {
    expect(getSafeCallbackUrl('dashboard')).toBe('/dashboard');
  });
});
