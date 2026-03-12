import { EventCookie, setCookie } from './cookie';

describe('EventCookie', () => {
  it('should have the correct name', () => {
    expect(EventCookie.name).toBe('event-id');
  });
});

describe('setCookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
  });

  it('should set a session cookie with the correct name and value', () => {
    setCookie({ name: 'test-cookie' }, 'test-value');
    expect(document.cookie).toBe('test-cookie=test-value; path=/;');
  });

  it('should set a cookie with max-age when provided', () => {
    setCookie({ name: 'test-cookie', maxAge: 3600 }, 'test-value');
    expect(document.cookie).toBe('test-cookie=test-value; path=/; max-age=3600;');
  });

  it('should not include max-age if it is not provided', () => {
    setCookie({ name: 'test-cookie' }, 'test-value');
    expect(document.cookie).toBe('test-cookie=test-value; path=/;');
  });
});
