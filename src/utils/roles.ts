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
