/**
 * Utility functions for working with user roles.
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

/**
 * Compares two UserRole objects for equality.
 * @param a - The first role to compare.
 * @param b - The second role to compare.
 * @returns True if the roles are equal, false otherwise.
 */
export const rolesEq = (a: UserRole, b: UserRole): boolean => {
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
 * Checks if a user's role matches an accepted role criteria, which may be more general (e.g. organiser for any event).
 * @param userRole - The user's role to check.
 * @param acceptedRole - The role to check against, which may have optional eventId and teamId for more general matching.
 * @returns True if the user's role matches the accepted role criteria, false otherwise.
 */
export const roleMatches = (userRole: UserRole, acceptedRole: UserRoleMatchCriteria): boolean => {
  switch (acceptedRole.type) {
    case 'admin':
      return userRole.type === 'admin';
    case 'organiser':
      return (
        userRole.type === 'organiser' &&
        (!acceptedRole.eventId || userRole.eventId === acceptedRole.eventId)
      );
    case 'team-lead':
      return (
        userRole.type === 'team-lead' &&
        (!acceptedRole.eventId || userRole.eventId === acceptedRole.eventId) &&
        (!acceptedRole.teamId || userRole.teamId === acceptedRole.teamId)
      );
    default:
      return false;
  }
};
