/**
 * NextJS Middlewares for the application
 * @author Michael Townsend <@continuities>
 * @since 2025-09-02
 */

// this will update the session expiry every time its called
export { auth as middleware } from '@/auth';
