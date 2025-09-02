/**
 * Authentication endpoint using NextAuth.js
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import { handlers } from '@/auth';
export const { GET, POST } = handlers;
