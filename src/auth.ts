/**
 * Authentication configuration using NextAuth.js
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: []
});
