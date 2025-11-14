/**
 * Service for fetching and updating user data from the database.
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import pool from '@/db';
import { PoolClient } from 'pg';
import { cache } from 'react';

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

const usersFromRows = (rows: any[]): User[] => {
  const usersMap = new Map<UserId, User>();

  rows.forEach((row) => {
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
 * Fetches a user by their ID.
 * @param userId - The unique identifier of the user.
 * @returns The User object if found, or null if not found.
 */
export const getUser = cache(async (userId: UserId): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT u.id, u.name, u.email, r.type, r."eventId", r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
    WHERE u.id = $1
  `,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return usersFromRows(result.rows)[0];
});

/**
 * Retrieves all the users in the system.
 * @returns A promise that resolves to an array of users.
 * @throws {Error} If the database query fails.
 */
export const getUsers = cache(async (): Promise<User[]> => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.email, r.type, r."eventId", r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
  `);

  return usersFromRows(result.rows);
});

/**
 * Fetches all users with a specific role.
 * @param role - The role to filter users by.
 * @returns An array of User objects that have the specified role.
 */
export const getUsersWithRole = cache(async (role: UserRole): Promise<User[]> => {
  const roleQuery = [`select 1 from role where "userId" = u.id and type=$1`];
  const queryParams: string[] = [role.type];
  if (role.type === 'organiser' || role.type === 'team-lead') {
    roleQuery.push(`"eventId" = $2`);
    queryParams.push(role.eventId);
  }
  if (role.type === 'team-lead') {
    roleQuery.push(`"teamId" = $3`);
    queryParams.push(role.teamId);
  }
  const result = await pool.query(
    `
    SELECT u.id, u.name, u.email, r.type, r."eventId", r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
    WHERE EXISTS (${roleQuery.join(' AND ')})
  `,
    queryParams
  );

  return usersFromRows(result.rows);
});

/**
 * Fetches all roles associated with a given user.
 * @param userId - The ID of the user to fetch roles for.
 * @returns An array of UserRole objects associated with the user.
 */
export const getUserRoles = cache(async (userId: UserId): Promise<UserRole[]> => {
  const result = await pool.query(
    'SELECT "type", "eventId", "teamId" FROM role WHERE "userId" = $1',
    [userId]
  );
  return result.rows.map(roleFromRow);
});

/**
 * Adds a role to a user.
 * @param userId - The ID of the user to add the role to.
 * @param role - The role to add.
 * @param client - Optional database client for transaction support.
 * @throws {Error} If the database query fails or the role is invalid.
 */
export const addRoleToUser = async (
  role: UserRole,
  userId: UserId,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
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

/**
 * Removes a role from a list of users.
 * @param role - The role to remove.
 * @param users - The list of user IDs to remove the role from.
 * @param client - Optional database client for transaction support.
 */
export const removeRoleFromUsers = async (
  role: UserRole,
  users: UserId[],
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
  const queryParams: any[] = [role.type, users];
  let query = 'DELETE FROM role WHERE type = $1 AND "userId" = ANY($2::text[])';

  if (role.type === 'organiser' || role.type === 'team-lead') {
    query += ' AND "eventId" = $3';
    queryParams.push(role.eventId);
  }
  if (role.type === 'team-lead') {
    query += ' AND "teamId" = $4';
    queryParams.push(role.teamId);
  }

  await db.query(query, queryParams);
};
