/**
 * Higher-level authorisation and session-related functions.
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import { cache } from 'react';
import { auth } from './auth';
import { headers } from 'next/headers';
import { getUser } from './service/user-service';
import { redirect, unauthorized } from 'next/navigation';

const rolesEq = (a: UserRole, b: UserRole): boolean => {
  switch (a.type) {
    case 'admin':
      return b.type === 'admin';
    case 'organiser':
      return b.type === 'organiser' && a.eventId === b.eventId;
    case 'team-lead':
      return b.type === 'team-lead' && a.eventId === b.eventId && a.teamId === b.teamId;
    default:
      return false;
  }
};

/**
 * Retrieves the currently authenticated user based on the session.
 * @returns The User object if authenticated, or null if not authenticated.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return null;
  }
  return getUser(session.user.id);
});

/**
 * Validates that the user is logged in and, optionally, has one of the accepted roles.
 * @param acceptedRoles - An optional array of UserRole objects that are accepted.
 * @returns True if the user is authorised, otherwise redirects.
 */
export const checkAuthorisation = async (acceptedRoles?: UserRole[]): Promise<boolean> => {
  const user = await currentUser();
  if (!user) {
    redirect('/');
  }
  if (!acceptedRoles || acceptedRoles.length === 0) {
    return true;
  }
  for (const role of acceptedRoles) {
    if (user.roles.find((userRole) => rolesEq(userRole, role))) {
      return true;
    }
  }
  unauthorized();
};
