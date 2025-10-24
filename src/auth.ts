/**
 * Authentication configuration using BetterAuth
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';
import db from '@/db';

if (!process.env.OAUTH_CLIENT_ID) {
  throw new Error('OAUTH_CLIENT_ID is not set in environment variables');
}

export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'local-pretix',
          clientId: process.env.OAUTH_CLIENT_ID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          discoveryUrl: 'http://localhost:8000/testorg/.well-known/openid-configuration'
        }
      ]
    })
  ],
  database: db
});
