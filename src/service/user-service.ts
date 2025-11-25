/**
 * Service for fetching and updating user data from the database.
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import pool from '@/db';
import { PoolClient } from 'pg';
import { cache } from 'react';
import { randomUUID } from 'crypto';

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
 * Fetches a user by their ID.
 * @param userId - The unique identifier of the user.
 * @returns The User object if found, or null if not found.
 */
export const getUser = cache(async (userId: UserId): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT u.id, u.name, u.email, u."emailVerified", r.type, r."eventId", r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
    WHERE u.id = $1
  `,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user: User = {
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
    emailVerified: result.rows[0].emailVerified,
    roles: []
  };

  result.rows.forEach((row) => {
    if (row.type) {
      user.roles.push(roleFromRow(row));
    }
  });

  return user;
});

/**
 * Retrieves all the users in the system.
 * @returns A promise that resolves to an array of users.
 * @throws {Error} If the database query fails.
 */
export const getUsers = cache(async (): Promise<User[]> => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.email, u."emailVerified", r.type, r."eventId", r."teamId"
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
        emailVerified: row.emailVerified,
        roles: []
      });
    }

    const user = usersMap.get(row.id)!;

    if (row.type) {
      user.roles.push(roleFromRow(row));
    }
  });

  return Array.from(usersMap.values());
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
 * Creates a new user in the database.
 * @param user - The user data, excluding the ID.
 * @param client - Optional database client for transaction support.
 * @return The newly created User object, including its ID.
 */
export const createUser = async (
  user: Omit<User, 'id' | 'roles'>,
  client?: PoolClient
): Promise<User> => {
  const db = client || pool;
  const id = randomUUID();
  const result = await db.query(
    'INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3) RETURNING id, name, email',
    [id, user.name, user.email]
  );
  const row = result.rows[0];
  const newUser: User = {
    id: row.id,
    name: row.name,
    email: row.email,
    roles: []
  };
  console.info('Created new user:', newUser);
  return newUser;
};

/**
 * Adds a role to a user.
 * @param userId - The ID of the user to add the role to.
 * @param role - The role to add.
 * @param client - Optional database client for transaction support.
 * @throws {Error} If the database query fails or the role is invalid.
 */
export const addUserRole = async (
  userId: UserId,
  role: UserRole,
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
 * Updates a user in the database.
 * @param userId - The ID of the user to update.
 * @param user - The user data to update.
 * @param client - Optional database client for transaction support.
 * @throws {Error} If the database query fails or the user is invalid.
 */
export const updateUser = async (
  userId: UserId,
  user: User,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
  await db.query('UPDATE "user" SET name = $1, email = $2, "emailVerified" = $3 WHERE id = $4', [
    user.name,
    user.email,
    userId
  ]);
};
