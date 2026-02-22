import {
  checkLoginLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
  checkSignInRateLimit
} from './login-security';

// Reset module state between tests
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllTimers();
  // Clear in-memory lockout state by advancing time past all lockout windows
  jest.advanceTimersByTime(20 * 60 * 1000);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('checkLoginLockout / recordFailedLogin', () => {
  it('allows sign-in when no failed attempts recorded', () => {
    expect(checkLoginLockout('fresh@example.com')).toBe(true);
  });

  it('allows sign-in below the lockout threshold', () => {
    for (let i = 0; i < 4; i++) {
      recordFailedLogin('user@example.com', null);
    }
    expect(checkLoginLockout('user@example.com')).toBe(true);
  });

  it('locks account after reaching the failure threshold', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedLogin('locked@example.com', null);
    }
    expect(checkLoginLockout('locked@example.com')).toBe(false);
  });

  it('is case-insensitive for email normalisation', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedLogin('UPPER@example.com', null);
    }
    expect(checkLoginLockout('upper@example.com')).toBe(false);
  });

  it('clears lockout after the lockout period expires', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedLogin('temp@example.com', null);
    }
    expect(checkLoginLockout('temp@example.com')).toBe(false);

    // Advance past the 15-minute lockout window
    jest.advanceTimersByTime(16 * 60 * 1000);
    expect(checkLoginLockout('temp@example.com')).toBe(true);
  });
});

describe('recordSuccessfulLogin', () => {
  it('clears failed-attempt state on successful login', () => {
    for (let i = 0; i < 4; i++) {
      recordFailedLogin('recover@example.com', null);
    }
    recordSuccessfulLogin('recover@example.com');
    // Should be allowed again (state cleared)
    expect(checkLoginLockout('recover@example.com')).toBe(true);
  });
});

describe('checkSignInRateLimit', () => {
  it('allows requests within the rate limit', () => {
    // Each call uses a unique IP to avoid cross-test state
    expect(checkSignInRateLimit('10.0.0.1')).toBe(true);
  });

  it('blocks requests exceeding the per-IP limit', () => {
    const ip = '10.0.0.99';
    // Exhaust the 20-request window
    for (let i = 0; i < 20; i++) {
      checkSignInRateLimit(ip);
    }
    expect(checkSignInRateLimit(ip)).toBe(false);
  });
});
