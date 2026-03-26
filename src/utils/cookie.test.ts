import { EventCookie, getCookie, setCookie } from './cookie';

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
describe('getCookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
  });

  it('should return the value of an existing cookie', () => {
    document.cookie = 'test-cookie=test-value';
    const result = getCookie('test-cookie');
    expect(result).toBe('test-value');
  });

  it('should return null if the cookie does not exist', () => {
    document.cookie = 'another-cookie=another-value';
    const result = getCookie('nonexistent-cookie');
    expect(result).toBeNull();
  });

  it('should handle cookies with encoded names and values', () => {
    document.cookie = `${encodeURIComponent('special cookie')}=${encodeURIComponent('special value')}`;
    const result = getCookie('special cookie');
    expect(result).toBe('special value');
  });

  it('should return null if the cookie name is partially matched', () => {
    document.cookie = 'test-cookie=test-value';
    const result = getCookie('test');
    expect(result).toBeNull();
  });

  it('should handle multiple cookies and return the correct value', () => {
    document.cookie = 'cookie1=value1; cookie2=value2; cookie3=value3';
    const result = getCookie('cookie2');
    expect(result).toBe('value2');
  });
});
