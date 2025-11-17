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
  if (process.env.DEBUG_FORCE_ROLE && process.env.NODE_ENV !== 'production') {
    switch (process.env.DEBUG_FORCE_ROLE) {
      case 'admin':
        return {
          id: 'debug-admin',
          name: 'Debug Admin',
          email: 'admin@localhost',
          roles: [{ type: 'admin' }]
        };
      case 'organiser':
        return {
          id: 'debug-organiser',
          name: 'Debug Organiser',
          email: 'organiser@localhost',
          roles: [{ type: 'organiser', eventId: 'debug-event' }]
        };
      case 'team-lead':
        return {
          id: 'debug-team-lead',
          name: 'Debug Team Lead',
          email: 'teamlead@localhost',
          roles: [{ type: 'team-lead', eventId: 'debug-event', teamId: 'debug-team' }]
        };
      case 'volunteer':
        return {
          id: 'debug-volunteer',
          name: 'Debug Volunteer',
          email: 'volunteer@localhost',
          roles: []
        };
    }
  }

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
 * @param checkOnly - If true, does not redirect on missing roles (default: false).
 * @returns True if the user is authorised, otherwise redirects.
 */
export const checkAuthorisation = async (
  acceptedRoles?: UserRole[],
  checkOnly = false
): Promise<boolean> => {
  const user = await currentUser();
  if (!user) {
    redirect('/');
    return false;
  }
  if (!acceptedRoles || acceptedRoles.length === 0) {
    return true;
  }
  for (const role of acceptedRoles) {
    if (user.roles.find((userRole) => rolesEq(userRole, role))) {
      return true;
    }
  }
  if (!checkOnly) {
    unauthorized();
  }
  return false;
};
