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
import db, { inTransaction } from '@/db';
import { sendEmail } from '@/email';
import enMessages from '../messages/en.json';
import {
  checkLoginLockout,
  recordSuccessfulLogin,
  checkSignInRateLimit
} from '@/lib/login-security';
import { addRoleToUser, getRoleCount } from './service/user-service';
import { cookies } from 'next/headers';

/** oauth = Pretix/OAuth provider, credentials = email/password. Defaults to oauth. */
export const AUTH_MODE = (process.env.AUTH_MODE ?? 'oauth') as 'oauth' | 'credentials';

const useOAuth = AUTH_MODE === 'oauth';
const isOAuthConfigComplete =
  process.env.OAUTH_CLIENT_ID &&
  process.env.OAUTH_PROVIDER_ID &&
  process.env.OAUTH_CLIENT_SECRET &&
  process.env.OAUTH_DISCOVERY_URL;

const plugins = [
  ...(useOAuth && isOAuthConfigComplete
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

const afterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path.startsWith('/sign-up')) {
    await inTransaction(async (client) => {
      if ((await getRoleCount('admin', client)) === 0) {
        // Make the first registered user an admin
        console.info('[auth] System has no admins, granting admin role to new user');
        const returned = ctx.context.returned as { user?: { id: string } } | Error | undefined;
        if (returned && !(returned instanceof Error) && returned.user) {
          await addRoleToUser({ type: 'admin' }, returned.user.id, client);
        }
      }
    });
    return;
  }
  if (!useOAuth && ctx.path === '/sign-in/email') {
    const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim() : '';
    if (!email) {
      return;
    }
    // Only clear lockout on success; failed attempts are recorded in the sign-in server action
    const returned = ctx.context.returned as { statusCode?: number } | Error | undefined;
    const isFailure =
      returned &&
      (returned instanceof Error ||
        (typeof returned === 'object' &&
          typeof (returned as { statusCode?: number }).statusCode === 'number' &&
          (returned as { statusCode: number }).statusCode >= 400));
    if (!isFailure) {
      recordSuccessfulLogin(email);
    }
    return;
  }
});

const beforeHook = createAuthMiddleware(async (ctx) => {
  if (useOAuth || ctx.path !== '/sign-in/email') {
    return;
  }
  const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim() : '';
  if (!email) {
    return;
  }
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

const sessionExpiresIn = Number(process.env.OAUTH_SESSION_EXPIRY_SECONDS);
const sessionUpdateAge = Number(process.env.OAUTH_SESSION_UPDATE_AGE_SECONDS);
const sessionConfig = useOAuth
  ? {
      expiresIn: sessionExpiresIn || 60 * 24 * 7, // 7 days
      updateAge: sessionUpdateAge || 60 * 24 // 24 hours
    }
  : undefined;

export const auth = betterAuth({
  plugins,
  database: db,
  user: {
    additionalFields: {
      chosenName: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: true
      }
    }
  },
  hooks: {
    before: beforeHook,
    after: afterHook
  },
  emailAndPassword: useOAuth
    ? undefined
    : {
        enabled: true,
        /** Reset token TTL in seconds. Tokens are single-use and invalidated after password change (better-auth). */
        resetPasswordTokenExpiresIn: Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN) || 15 * 60,
        sendResetPassword: async ({ user, url }) => {
          if (process.env.SMTP_HOST) {
            const result = await sendEmail({
              to: user.email,
              subject: enMessages.ResetPasswordEmail.subject,
              text: enMessages.ResetPasswordEmail.text.replace('{url}', url)
            });
            if (result.status === 'failed') {
              console.error(
                '[auth] Password reset email failed for %s: %s',
                user.email,
                result.error
              );
            }
          } else if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(`[Better Auth] Password reset for ${user.email}: ${url}`);
          }
        }
      },
  session: sessionConfig,
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

/**
 * Sign out the current user and return the redirect URL
 * If using OAuth and OAUTH_LOGOUT_URL is set, this will be the URL to log out of the OAuth provider; otherwise, it will be the home page.
 * @param headers
 * @returns URL to redirect the user to after signing out
 */
export const signOut = async (headers: HeadersInit) => {
  'use server';
  await auth.api.signOut({
    headers
  });
  const cookieStore = await cookies();
  cookieStore.delete('event-id');
  if (useOAuth && process.env.OAUTH_LOGOUT_URL) {
    return process.env.OAUTH_LOGOUT_URL;
  }
  return '/';
};
