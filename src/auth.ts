/**
 * Authentication configuration using BetterAuth
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';
import db from '@/db';

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
export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: process.env.OAUTH_PROVIDER_ID,
          clientId: process.env.OAUTH_CLIENT_ID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          discoveryUrl: process.env.OAUTH_DISCOVERY_URL
        }
      ]
    }),
    nextCookies()
  ],
  database: db,
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true
    }
  }
});
