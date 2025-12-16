/**
 * Proxy to protect routes and redirect unauthenticated users to /signin
 * @since 2025-01-27
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

const isLocalRequest = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  return forwardedFor === '127.0.0.1' || forwardedFor === '::1';
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set a custom header with the pathname so we can access it in server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Allow access to API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  // Allow access to signin page
  if (pathname === '/signin') {
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  if (
    process.env.DEBUG_FORCE_ROLE &&
    process.env.NODE_ENV !== 'production' &&
    isLocalRequest(request)
  ) {
    // In debug mode, bypass authentication
    // User will be set in session.ts::currentUser() based on the DEBUG_FORCE_ROLE env var
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  // Check authentication for all other routes
  // Since proxy runs in Node.js runtime, we can use BetterAuth's API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  // If not authenticated, redirect to signin
  if (!session?.user) {
    const signInUrl = new URL('/signin', request.url);
    // Preserve the original URL as a query parameter for redirect after signin
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, allow the request
  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
