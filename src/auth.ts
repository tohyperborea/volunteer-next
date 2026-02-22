/**
 * Authentication configuration using BetterAuth
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 *
 * Set AUTH_MODE=oauth for Pretix/OAuth or AUTH_MODE=credentials for email/password.
 */

import { betterAuth } from 'better-auth';
import { createAuthMiddleware, APIError, getIp } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';
import db from '@/db';
import { sendEmail } from '@/email';
import {
  checkLoginLockout,
  recordSuccessfulLogin,
  checkSignInRateLimit
} from '@/lib/login-security';

/** oauth = Pretix/OAuth provider, credentials = email/password. Defaults to oauth. */
export const AUTH_MODE = (process.env.AUTH_MODE ?? 'oauth') as 'oauth' | 'credentials';

const useOAuth = AUTH_MODE === 'oauth';

if (useOAuth) {
  if (!process.env.OAUTH_CLIENT_ID) {
    throw new Error('OAUTH_CLIENT_ID is not set in environment variables');
  }
  if (!process.env.OAUTH_PROVIDER_ID) {
    throw new Error('OAUTH_PROVIDER_ID is not set in environment variables');
  }
  if (!process.env.OAUTH_CLIENT_SECRET) {
    throw new Error('OAUTH_CLIENT_SECRET is not set in environment variables');
  }
  if (!process.env.OAUTH_DISCOVERY_URL) {
    throw new Error('OAUTH_DISCOVERY_URL is not set in environment variables');
  }
}

const plugins = [
  ...(useOAuth
    ? [
        genericOAuth({
          config: [
            {
              providerId: process.env.OAUTH_PROVIDER_ID!,
              clientId: process.env.OAUTH_CLIENT_ID!,
              clientSecret: process.env.OAUTH_CLIENT_SECRET!,
              discoveryUrl: process.env.OAUTH_DISCOVERY_URL!
            }
          ]
        })
      ]
    : []),
  nextCookies()
];

const signInEmailBeforeHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== '/sign-in/email') return;
  const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim() : '';
  if (!email) return;
  if (!checkLoginLockout(email)) {
    throw new APIError('TOO_MANY_REQUESTS', {
      message: 'Too many failed attempts. Try again in 15 minutes.'
    });
  }
  const request = ctx.request as Request | undefined;
  const ip = request ? getIp(request, ctx.context.options) : null;
  if (ip && !checkSignInRateLimit(ip)) {
    throw new APIError('TOO_MANY_REQUESTS', {
      message: 'Too many requests. Try again later.'
    });
  }
});

const signInEmailAfterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== '/sign-in/email') return;
  const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim() : '';
  if (!email) return;
  // Only clear lockout on success; failed attempts are recorded in the sign-in server action
  const returned = ctx.context.returned as { statusCode?: number } | Error | undefined;
  const isFailure =
    returned &&
    (returned instanceof Error ||
      (typeof returned === 'object' && typeof (returned as { statusCode?: number }).statusCode === 'number' && (returned as { statusCode: number }).statusCode >= 400));
  if (!isFailure) recordSuccessfulLogin(email);
});

export const auth = betterAuth({
  plugins,
  database: db,
  hooks:
    useOAuth
      ? undefined
      : {
          before: signInEmailBeforeHook,
          after: signInEmailAfterHook
        },
  emailAndPassword: useOAuth
    ? undefined
    : {
        enabled: true,
        /** Reset token TTL in seconds. Tokens are single-use and invalidated after password change (better-auth). */
        resetPasswordTokenExpiresIn: 15 * 60, // 15 minutes
        sendResetPassword: async ({ user, url }) => {
          if (process.env.SMTP_HOST) {
            const result = await sendEmail({
              to: user.email,
              subject: 'Reset your password',
              text: `Click the link to reset your password: ${url}`
            });
            if (!result.sent && result.error) {
              console.error('[auth] Password reset email failed for %s: %s', user.email, result.error);
            }
          } else if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(`[Better Auth] Password reset for ${user.email}: ${url}`);
          }
        }
      },
  advanced: {
    defaultCookieAttributes: {
      // 'lax' reduces CSRF risk; use 'none' only if you need cookies on cross-site requests (e.g. embedded iframes).
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/'
    }
  }
});
