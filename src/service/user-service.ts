/**
 * Service for fetching and updating user data from the database.
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import pool from '@/db';
import { PoolClient } from 'pg';
import { cache } from 'react';
import { randomUUID } from 'node:crypto';
import { canAccess } from '@/utils/permissions';
import { usersToVolunteers, userToVolunteer } from '@/lib/volunteer';

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
        chosenName: row.chosenName,
        email: row.email,
        roles: [],
        deletedAt: row.deletedAt
          ? row.deletedAt instanceof Date
            ? row.deletedAt
            : new Date(row.deletedAt)
          : undefined
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
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns The User object if found, or null if not found.
 */
export const getUser = cache(async (userId: UserId, eventId?: EventId): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u."chosenName",
      u.email,
      u."deletedAt",
      r.type,
      r."eventId",
      r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
      AND (r."eventId" IS NULL OR r."eventId" = $2)
    WHERE u.id = $1
  `,
    [userId, eventId ?? null]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return usersFromRows(result.rows)[0];
});

/**
 * Retrieves all the users in the system.
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns A promise that resolves to an array of users.
 * @throws {Error} If the database query fails.
 */
export const getUsers = cache(async (eventId?: EventId): Promise<User[]> => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u."chosenName",
      u.email,
      u."deletedAt",
      r.type,
      r."eventId",
      r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
      AND (r."eventId" IS NULL OR r."eventId" = $1)
    `,
    [eventId ?? null]
  );

  return usersFromRows(result.rows);
});

/**
 * Versatile fetch based on a UserFilters object
 * @param filters - The filters to apply when fetching users.
 * @param permissionsProfile - The permissions profile of the requesting user, used to determine which fields can be searched.
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns A promise that resolves to an array of users matching the filters.
 * @throws {Error} If the database query fails.
 */
export const getFilteredUsers = cache(
  async (
    filters: UserFilters,
    permissionsProfile: PermissionsProfile,
    eventId?: EventId
  ): Promise<User[]> => {
    const queryParts: string[] = [];
    const queryParams: any[] = [eventId ?? null];

    if (filters.searchQuery) {
      // This method of searching is slow, but will be fine for < 400k users
      const canAccessName = canAccess('VolunteerInfo', 'fullName', permissionsProfile);
      const canAccessEmail = canAccess('VolunteerInfo', 'email', permissionsProfile);
      queryParams.push(`%${filters.searchQuery}%`);
      const index = queryParams.length;
      const matchers = [`u."chosenName" ILIKE $${index}`];
      if (canAccessEmail) {
        matchers.push(`u.email ILIKE $${index}`);
      }
      if (canAccessName) {
        matchers.push(`u.name ILIKE $${index}`);
      }
      queryParts.push(`(${matchers.join(' OR ')})`);
    }
    if (!filters.showDeleted) {
      queryParts.push(`u."deletedAt" IS NULL`);
    }
    if (filters.roleType) {
      queryParams.push(filters.roleType);
      queryParts.push(
        `EXISTS (SELECT 1 FROM role r WHERE r."userId" = u.id AND r.type = $${queryParams.length})`
      );
    }
    if (filters.withQualification) {
      queryParams.push(filters.withQualification);
      queryParts.push(
        `EXISTS (SELECT 1 FROM user_qualification uq WHERE uq."userId" = u.id AND uq."qualificationId" = $${queryParams.length})`
      );
    }
    if (filters.withoutQualification) {
      queryParams.push(filters.withoutQualification);
      queryParts.push(
        `NOT EXISTS (SELECT 1 FROM user_qualification uq WHERE uq."userId" = u.id AND uq."qualificationId" = $${queryParams.length})`
      );
    }
    if (filters.onTeam) {
      queryParams.push(filters.onTeam);
      queryParts.push(
        `EXISTS (SELECT 1 FROM shift_volunteer sv JOIN shift s ON sv.shift_id = s.id WHERE sv.user_id = u.id AND s."teamId" = $${queryParams.length})`
      );
    }
    if (filters.eventHours !== undefined && filters.eventId) {
      queryParams.push(filters.eventId, filters.eventHours);
      queryParts.push(
        `
        (
        SELECT COALESCE(SUM(s."durationHours"), 0)
        FROM shift_volunteer sv 
        JOIN shift s ON s.id=sv.shift_id 
        JOIN team t ON s."teamId" = t.id
        AND t."eventId"=$${queryParams.length - 1}
        WHERE sv.user_id = u.id
        ) >= $${queryParams.length}
        `
      );
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u."chosenName",
        u.email,
        u."deletedAt",
        r.type,
        r."eventId",
        r."teamId"
      FROM "user" u
      LEFT JOIN role r ON u.id = r."userId"
        AND (r."eventId" IS NULL OR r."eventId" = $1)
      ${whereClause}
      ORDER BY u."chosenName" ASC
    `,
      queryParams
    );

    return usersFromRows(result.rows);
  }
);

/**
 * Fetches volunteers based on filters and permissions profile.
 * @param filters - The filters to apply when fetching volunteers.
 * @param permissionsProfile - The permissions profile of the requesting user
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns A promise that resolves to an array of VolunteerInfo objects
 */
export const getFilteredVolunteers = cache(
  async (
    filters: UserFilters,
    permissionsProfile: PermissionsProfile,
    eventId?: EventId
  ): Promise<VolunteerInfo[]> => {
    const users = await getFilteredUsers(filters, permissionsProfile, eventId);
    return usersToVolunteers(users, permissionsProfile);
  }
);

/**
 * Fetches all users with a specific role.
 * @param role - The role to filter users by.
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns An array of User objects that have the specified role.
 */
export const getUsersWithRole = cache(
  async (role: UserRole, eventId?: EventId): Promise<User[]> => {
    const roleQuery = [`select 1 from role where "userId" = u.id and type=$2`];
    const queryParams = [eventId ?? null, role.type];
    if (role.type === 'organiser' || role.type === 'team-lead') {
      roleQuery.push(`"eventId" = $3`);
      queryParams.push(role.eventId);
    }
    if (role.type === 'team-lead') {
      roleQuery.push(`"teamId" = $4`);
      queryParams.push(role.teamId);
    }
    const result = await pool.query(
      `
    SELECT
      u.id,
      u.name,
      u."chosenName",
      u.email,
      u."deletedAt",
      r.type,
      r."eventId",
      r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
      AND (r."eventId" IS NULL OR r."eventId" = $1)
    WHERE EXISTS (${roleQuery.join(' AND ')})
  `,
      queryParams
    );

    return usersFromRows(result.rows);
  }
);

/**
 * Fetches all roles associated with a given user.
 * @param userId - The ID of the user to fetch roles for.
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns An array of UserRole objects associated with the user.
 */
export const getUserRoles = cache(async (userId: UserId, eventId: EventId): Promise<UserRole[]> => {
  const result = await pool.query(
    `
    SELECT 
      "type", 
      "eventId", 
      "teamId" 
    FROM role 
    WHERE "userId" = $1
    AND ("eventId" IS NULL OR "eventId" = $2)
    `,
    [userId, eventId]
  );
  return result.rows.map(roleFromRow);
});

/**
 * Creates a new user in the database.
 * @param user - The user data, excluding the ID.
 * @param client - Optional database client for transaction support.
 * @return The newly created User object, including its ID.
 */
export const createUser = async (user: UserCreationModel, client?: PoolClient): Promise<User> => {
  const db = client || pool;
  const id = randomUUID();
  const result = await db.query(
    `INSERT INTO "user" (
      id,
      name,
      "chosenName",
      email,
      "emailVerified"
    ) VALUES ($1, $2, $3, $4, $5) 
    RETURNING
      id,
      name,
      "chosenName",
      email`,
    [id, user.name, user.chosenName, user.email, false]
  );
  const row = result.rows[0];
  const newUser: User = {
    id: row.id,
    name: row.name,
    chosenName: row.chosenName,
    email: row.email,
    roles: []
  };
  return newUser;
};

/**
 * Updates a user in the database.
 * @param userId - The ID of the user to update.
 * @param user - The user data to update, excluding the ID.
 * @param client - Optional database client for transaction support.
 * @throws {Error} If the database query fails or the user is invalid.
 */
export const updateUser = async (
  userId: UserId,
  user: UserUpdateModel,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
  await db.query(
    `
    UPDATE "user"
    SET
      name = $1,
      "chosenName" = $2,
      email = $3
    WHERE id = $4`,
    [user.name, user.chosenName, user.email, userId]
  );
};

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

/**
 * Gets the count of users with a specific role type.
 * @param type - The role type to count.
 * @returns The count of users with the specified role type.
 */
export const getRoleCount = cache(async (type: UserRoleType, client?: PoolClient) => {
  const db = client || pool;
  const result = await db.query(
    `
    SELECT COUNT(*) 
    FROM role
    INNER JOIN "user" u ON role."userId" = u.id
    WHERE role.type = $1
    AND u."deletedAt" IS NULL
    `,
    [type]
  );
  return parseInt(result.rows[0].count, 10);
});

/**
 * Marks a user as deleted.
 * @param userId - The ID of the user to mark as deleted.
 * @param client - Optional database client for transaction support.
 */
export const markUserAsDeleted = async (userId: UserId, client?: PoolClient): Promise<void> => {
  const db = client || pool;
  await db.query('UPDATE "user" SET "deletedAt" = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

/**
 * Removes the deletion mark from a user.
 * @param userId - The ID of the user to remove the deletion mark from.
 * @param client - Optional database client for transaction support.
 */
export const undeleteUser = async (userId: UserId, client?: PoolClient): Promise<void> => {
  const db = client || pool;
  await db.query('UPDATE "user" SET "deletedAt" = NULL WHERE id = $1', [userId]);
};

/**
 * Fetches all team leads for a given team.
 * @param teamId - The ID of the team to fetch leads for.
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns An array of User objects that are team leads for the specified team.
 */
export const getTeamLeadsForTeam = cache(
  async (teamId: TeamId, eventId: EventId): Promise<User[]> => {
    const result = await pool.query(
      `
    SELECT
      u.id,
      u.name,
      u."chosenName",
      u.email,
      u."deletedAt",
      r.type,
      r."eventId",
      r."teamId"
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
      AND (r."eventId" IS NULL OR r."eventId" = $1)
    WHERE r.type = 'team-lead' AND r."teamId" = $2
  `,
      [eventId ?? null, teamId]
    );

    if (result.rows.length === 0) {
      return [];
    }

    return usersFromRows(result.rows);
  }
);

/**
 * Fetches all volunteers for a given list of shifts
 * @param shiftIds - An array of shift IDs to fetch volunteers for
 * @param permissionsProfile - The permissions profile of the requesting user
 * @param eventId - Optional event ID to filter roles by (only include roles for the specified event or global roles).
 * @returns A record mapping ShiftID to VolunteerInfo[]
 */
export const getVolunteersForShifts = cache(
  async (
    shiftIds: ShiftId[],
    permissionsProfile: PermissionsProfile,
    eventId: EventId
  ): Promise<Record<ShiftId, VolunteerInfo[]>> => {
    const result = await pool.query(
      `
    SELECT
      u.id,
      u.name,
      u."chosenName",
      u.email,
      u."deletedAt",
      r.type,
      r."eventId",
      r."teamId",
      sv.shift_id
    FROM "user" u
    LEFT JOIN role r ON u.id = r."userId"
      AND (r."eventId" IS NULL OR r."eventId" = $2)
    JOIN shift_volunteer sv ON sv.user_id = u.id
    WHERE sv.shift_id = ANY($1::uuid[])
  `,
      [shiftIds, eventId]
    );

    const volunteersByShift: Record<ShiftId, VolunteerInfo[]> = {};
    const users = usersFromRows(result.rows);
    const userMap = new Map(users.map((u) => [u.id, u]));
    const seenByShift: Record<ShiftId, Set<UserId>> = {};
    result.rows.forEach((row: any) => {
      const shiftId: ShiftId = row.shift_id;
      if (!volunteersByShift[shiftId]) {
        volunteersByShift[shiftId] = [];
      }
      const user = userMap.get(row.id);
      if (user && !seenByShift[shiftId]?.has(user.id)) {
        if (!seenByShift[shiftId]) {
          seenByShift[shiftId] = new Set();
        }
        seenByShift[shiftId].add(user.id);
        volunteersByShift[shiftId].push(userToVolunteer(user, permissionsProfile));
      }
    });

    return volunteersByShift;
  }
);
