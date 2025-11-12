/**
 * Service for fetching and updating user data from the database.
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import db from '@/db';

const roleFromRow = (row: any): UserRole => {
  switch (row.type) {
    case 'admin':
      return { type: 'admin' };
    case 'organiser':
      if (!row.eventId) {
        throw new Error(`Organiser role missing eventId for user ${row.id}`);
      }
      return { type: 'organiser', eventId: row.eventId };
    case 'team-lead':
      if (!row.eventId || !row.teamId) {
        throw new Error(`Team-lead role missing eventId or teamId for user ${row.id}`);
      }
      return { type: 'team-lead', eventId: row.eventId, teamId: row.teamId };
    default:
      throw new Error(`Unknown role type: ${row.type}`);
  }
};

/**
 * Retrieves all the users in the system.
 * @returns A promise that resolves to an array of users.
 * @throws {Error} If the database query fails.
 */
export const getUsers = async (): Promise<User[]> => {
  const result = await db.query(`
    SELECT u.id, u.name, u.email, r.type, r."eventId", r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
  `);

  const usersMap = new Map<UserId, User>();

  result.rows.forEach((row) => {
    if (!usersMap.has(row.id)) {
      usersMap.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        roles: []
      });
    }

    const user = usersMap.get(row.id)!;

    if (row.type) {
      user.roles.push(roleFromRow(row));
    }
  });

  return Array.from(usersMap.values());
};

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
  return result.rows.map(roleFromRow);
};

/**
 * Adds a role to a user.
 * @param userId - The ID of the user to add the role to.
 * @param role - The role to add.
 * @throws {Error} If the database query fails or the role is invalid.
 */
export const addUserRole = async (userId: UserId, role: UserRole): Promise<void> => {
  switch (role.type) {
    case 'admin':
      await db.query('INSERT INTO role ("userId", "type") VALUES ($1, $2)', [userId, 'admin']);
      break;
    case 'organiser':
      if (!role.eventId) {
        throw new Error('Organiser role requires an eventId');
      }
      await db.query('INSERT INTO role ("userId", "type", "eventId") VALUES ($1, $2, $3)', [
        userId,
        'organiser',
        role.eventId
      ]);
      break;
    case 'team-lead':
      if (!role.eventId || !role.teamId) {
        throw new Error('Team-lead role requires both eventId and teamId');
      }
      await db.query(
        'INSERT INTO role ("userId", "type", "eventId", "teamId") VALUES ($1, $2, $3, $4)',
        [userId, 'team-lead', role.eventId, role.teamId]
      );
      break;
    default:
      throw new Error(`Invalid role: ${JSON.stringify(role)}`);
  }
  console.info(`Added role ${JSON.stringify(role)} to user ${userId}`);
};
