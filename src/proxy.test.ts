import '@testing-library/jest-dom';

// Mock next/server before any other imports
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

  class MockNextRequest {
    url: string;
    nextUrl: URL;
    headers: InstanceType<typeof HeadersImpl>;

    constructor(input: string | URL, init?: { headers?: InstanceType<typeof HeadersImpl> }) {
      const url = typeof input === 'string' ? new URL(input, 'http://localhost:3000') : input;
      this.url = url.toString();
      this.nextUrl = url;
      this.headers = init?.headers || new HeadersImpl();
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

import { proxy } from './proxy';
import { auth } from '@/auth';

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
    const { NextRequest } = require('next/server');
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

  describe('signin page', () => {
    it('allows access to signin page without authentication', async () => {
      const request = createMockRequest('/signin');
      const response = await proxy(request);

      expect(mockGetSession).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
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
  });
});
