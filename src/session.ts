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
import { roleMatches } from './utils/roles';
import { getEventsPath } from './utils/path';
import { getEventsById } from './service/event-service';

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
          chosenName: 'Debug Admin',
          email: 'admin@localhost',
          roles: [{ type: 'admin' }]
        };
      case 'organiser':
        return {
          id: 'debug-organiser',
          name: 'Debug Organiser',
          chosenName: 'Debug Organiser',
          email: 'organiser@localhost',
          roles: [
            {
              type: 'organiser',
              eventId: process.env.DEBUG_FORCE_ROLE_EVENTID ?? 'debug-event'
            }
          ]
        };
      case 'team-lead':
        return {
          id: 'debug-team-lead',
          name: 'Debug Team Lead',
          chosenName: 'Debug Team Lead',
          email: 'teamlead@localhost',
          roles: [
            {
              type: 'team-lead',
              eventId: process.env.DEBUG_FORCE_ROLE_EVENTID ?? 'debug-event',
              teamId: process.env.DEBUG_FORCE_ROLE_TEAMID ?? 'debug-team'
            }
          ]
        };
      case 'volunteer':
        return {
          id: 'debug-volunteer',
          name: 'Debug Volunteer',
          chosenName: 'Debug Volunteer',
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
 * @param acceptedRoles - An optional array of UserRoleMatchCriteria objects that are accepted.
 * @param checkOnly - If true, does not redirect on missing roles (default: false).
 * @returns True if the user is authorised, otherwise redirects.
 */
export const checkAuthorisation = async (
  acceptedRoles?: UserRoleMatchCriteria[],
  checkOnly = false
): Promise<boolean> => {
  const user = await currentUser();
  if (!user) {
    redirect('/');
  }
  if (!acceptedRoles || acceptedRoles.length === 0) {
    return true;
  }
  for (const role of acceptedRoles) {
    if (user.roles.find((userRole) => roleMatches(userRole, role))) {
      return true;
    }
  }
  if (!checkOnly) {
    unauthorized();
  }
  return false;
};

/**
 * Finds and returns the user's roles that match the provided criteria.
 * @param toMatch - A UserRoleMatchCriteria to match against the user's roles.
 * @returns An array of UserRole objects from the user's roles that match any of the provided criteria.
 */
export const getMatchingRoles = async (toMatch: UserRoleMatchCriteria): Promise<UserRole[]> => {
  const user = await currentUser();
  if (!user) {
    return [];
  }
  return user.roles.filter((userRole) => roleMatches(userRole, toMatch));
};

/**
 * Retrieves the current event based on the 'x-event-id' header.
 * @returns The current event based on the 'x-event-id' header, or null if not found.
 */
export const getCurrentEvent = async (): Promise<EventInfo | null> => {
  const eventId = (await headers()).get('x-event-id');
  return eventId ? (await getEventsById([eventId]))[0] : null;
};

/**
 * Retrieves the current event based on the 'x-event-id' header, or redirects to the event list page if not found.
 * @returns The current event based on the 'x-event-id' header
 * @throws NEXT_REDIRECT if no event is found, redirecting to the event list page
 */
export const getCurrentEventOrRedirect = async (): Promise<EventInfo> => {
  const event = await getCurrentEvent();
  if (!event) {
    redirect(getEventsPath());
  }
  return event;
};
