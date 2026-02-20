/**
 * Authentication configuration using BetterAuth
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 *
 * Set AUTH_MODE=oauth for Pretix/OAuth or AUTH_MODE=credentials for email/password.
 */

import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';
import db from '@/db';
import { sendEmail } from '@/email';

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

export const auth = betterAuth({
  plugins,
  database: db,
  emailAndPassword: useOAuth
    ? undefined
    : {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
          if (process.env.SMTP_HOST) {
            void sendEmail({
              to: user.email,
              subject: 'Reset your password',
              text: `Click the link to reset your password: ${url}`
            });
          } else if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(`[Better Auth] Password reset for ${user.email}: ${url}`);
          }
        }
      },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true
    }
  }
});
