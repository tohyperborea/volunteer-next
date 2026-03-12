import '@testing-library/jest-dom';
import { proxy } from './proxy';
import { auth } from '@/auth';
import { getActiveEvents } from './service/event-service';
import { NextResponse, NextRequest } from 'next/server';
import { isKeyObject } from 'util/types';
import { EventCookie } from './utils/cookie';

// Mock next/server to provide NextRequest and NextResponse for testing
jest.mock('next/server', () => {
  // Ensure Headers is available
  const HeadersImpl =
    typeof Headers !== 'undefined'
      ? Headers
      : class Headers {
          private map = new Map<string, string>();
          get(name: string) {
            return this.map.get(name.toLowerCase()) || null;
          }
          set(name: string, value: string) {
            this.map.set(name.toLowerCase(), value);
          }
          has(name: string) {
            return this.map.has(name.toLowerCase());
          }
        };

  const CookiesImpl = class Cookies {
    private map = new Map<string, { value: string }>();
    get(name: string) {
      return this.map.get(name) || null;
    }
    set(name: string, value: string) {
      this.map.set(name, { value });
    }
  };

  class MockNextRequest {
    url: string;
    nextUrl: URL;
    headers: InstanceType<typeof HeadersImpl>;
    cookies: InstanceType<typeof CookiesImpl>;

    constructor(
      input: string | URL,
      init?: {
        headers?: InstanceType<typeof HeadersImpl>;
      }
    ) {
      const url = typeof input === 'string' ? new URL(input, 'http://localhost:3000') : input;
      this.url = url.toString();
      this.nextUrl = url;
      this.headers = init?.headers || new HeadersImpl();
      this.cookies = new CookiesImpl();
    }
  }

  class MockNextResponse {
    status: number;
    headers: InstanceType<typeof HeadersImpl>;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.status = init?.status || 200;
      this.headers = new HeadersImpl(init?.headers);
    }

    static next() {
      return new MockNextResponse(null, { status: 200 });
    }

    static redirect(url: string | URL) {
      const response = new MockNextResponse(null, { status: 307 });
      response.headers.set('location', url.toString());
      return response;
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse
  };
});

jest.mock('@/service/event-service', () => ({
  getActiveEvents: jest.fn()
}));

const mockGetActiveEvents = getActiveEvents as jest.MockedFunction<typeof getActiveEvents>;

// Mock dependencies
jest.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn()
    }
  }
}));

describe('proxy', () => {
  const mockGetSession = auth.api.getSession as jest.MockedFunction<typeof auth.api.getSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (pathname: string, origin = 'http://localhost:3000') => {
    const url = new URL(pathname, origin);
    return new NextRequest(url, {
      headers: new Headers()
    });
  };

  const getLocationPath = (location: string | null): string => {
    if (!location) return '';
    try {
      const url = new URL(location);
      return url.pathname + url.search;
    } catch {
      // If it's already a path, return as is
      return location;
    }
  };

  describe('API routes', () => {
    it('allows access to API routes without authentication', async () => {
      const request = createMockRequest('/api/ping');
      const response = await proxy(request);

      expect(mockGetSession).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('allows access to auth API routes', async () => {
      const request = createMockRequest('/api/auth/signin');
      const response = await proxy(request);

      expect(mockGetSession).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('public auth pages', () => {
    it.each(['/signin', '/signup', '/forgot-password', '/reset-password'])(
      'allows access to %s without authentication',
      async (pathname) => {
        const request = createMockRequest(pathname);
        const response = await proxy(request);

        expect(mockGetSession).not.toHaveBeenCalled();
        expect(response.status).toBe(200);
      }
    );
  });

  describe('protected routes', () => {
    it('redirects unauthenticated users to signin with callbackUrl', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = createMockRequest('/event');
      const response = await proxy(request);

      expect(mockGetSession).toHaveBeenCalledWith({
        headers: request.headers
      });
      expect(response.status).toBe(307); // Redirect status
      expect(getLocationPath(response.headers.get('location'))).toBe(
        '/signin?callbackUrl=%2Fevent'
      );
    });

    it('preserves the original pathname in callbackUrl', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = createMockRequest('/event/my-event/team');
      const response = await proxy(request);

      expect(getLocationPath(response.headers.get('location'))).toBe(
        '/signin?callbackUrl=%2Fevent%2Fmy-event%2Fteam'
      );
    });

    it('allows authenticated users to access protected routes', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      } as any);
      mockGetActiveEvents.mockResolvedValue([]);

      const request = createMockRequest('/event');
      const response = await proxy(request);

      expect(mockGetSession).toHaveBeenCalledWith({
        headers: request.headers
      });
      expect(response.status).toBe(200);
    });

    it('redirects when session exists but user is missing', async () => {
      mockGetSession.mockResolvedValue({
        user: null
      } as any);

      const request = createMockRequest('/create-event');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(getLocationPath(response.headers.get('location'))).toBe(
        '/signin?callbackUrl=%2Fcreate-event'
      );
    });

    it('sets x-pathname header', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      } as any);
      jest.spyOn(NextResponse, 'next');

      const request = createMockRequest('/dashboard');
      const response = await proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
      const calledWith = (NextResponse.next as jest.Mock).mock.calls[0][0];
      const headers: Headers = calledWith.request.headers;
      expect(headers.get('x-pathname')).toBe('/dashboard');
      expect(response.status).toBe(200);
    });

    it('sets x-event-id header from EventCookie', async () => {
      mockGetActiveEvents.mockResolvedValue([]);
      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      } as any);

      const request = createMockRequest('/dashboard');
      request.cookies.set(EventCookie.name, 'event-1');

      const response = await proxy(request);
      expect(mockGetActiveEvents).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
      const calledWith = (NextResponse.next as jest.Mock).mock.calls[0][0];
      const headers: Headers = calledWith.request.headers;
      expect(headers.get('x-event-id')).toBe('event-1');
      expect(response.status).toBe(200);
    });

    it('defaults x-event-id header to first active event', async () => {
      mockGetActiveEvents.mockResolvedValue([
        {
          id: 'event-1',
          name: 'Event 1',
          slug: 'event-1',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-01-05')
        },
        {
          id: 'event-2',
          name: 'Event 2',
          slug: 'event-2',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-05')
        }
      ]);

      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      } as any);

      const request = createMockRequest('/dashboard');
      const response = await proxy(request);

      expect(mockGetActiveEvents).toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
      const calledWith = (NextResponse.next as jest.Mock).mock.calls[0][0];
      const headers: Headers = calledWith.request.headers;
      expect(headers.get('x-event-id')).toBe('event-1');
      expect(response.status).toBe(200);
    });

    it('still works when there are no active events', async () => {
      mockGetActiveEvents.mockResolvedValue([]);

      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      } as any);

      const request = createMockRequest('/dashboard');
      const response = await proxy(request);

      expect(mockGetActiveEvents).toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
      const calledWith = (NextResponse.next as jest.Mock).mock.calls[0][0];
      const headers: Headers = calledWith.request.headers;
      expect(headers.get('x-event-id')).toBeNull();
      expect(response.status).toBe(200);
    });
  });
});
