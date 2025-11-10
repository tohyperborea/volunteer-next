/**
 * Service for fetching and updating user data from the database.
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import db from '@/db';

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
        return { type: 'organiser', eventId: row.eventId };
      case 'team-lead':
        return { type: 'team-lead', eventId: row.eventId, teamId: row.teamId };
      default:
        throw new Error(`Unknown role type: ${row.type}`);
    }
  });
};
