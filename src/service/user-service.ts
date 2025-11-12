/**
 * Service for fetching and updating user data from the database.
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import db from '@/db';

/**
 * Fetches all roles associated with a given user.
 * @param userId - The ID of the user to fetch roles for.
 * @returns An array of UserRole objects associated with the user.
 */
export const getUserRoles = async (userId: UserId): Promise<UserRole[]> => {
  const result = await db.query(
    'SELECT "type", "eventId", "teamId" FROM role WHERE "userId" = $1',
    [userId]
  );
  return result.rows.map((row) => {
    switch (row.type) {
      case 'admin':
        return { type: 'admin' };
      case 'organiser':
        if (!row.eventId) {
          throw new Error(`Organiser role missing eventId for user ${userId}`);
        }
        return { type: 'organiser', eventId: row.eventId };
      case 'team-lead':
        if (!row.eventId || !row.teamId) {
          throw new Error(`Team-lead role missing eventId or teamId for user ${userId}`);
        }
        return { type: 'team-lead', eventId: row.eventId, teamId: row.teamId };
      default:
        throw new Error(`Unknown role type: ${row.type}`);
    }
  });
};
