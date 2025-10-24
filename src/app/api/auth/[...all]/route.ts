/**
 * Authentication endpoint using Better Auth
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

import { auth } from '@/auth';
import { toNextJsHandler } from 'better-auth/next-js';
export const { GET, POST } = toNextJsHandler(auth.handler);
