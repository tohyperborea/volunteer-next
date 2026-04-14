/**
 * Service for managing shifts in the database
 *
 * 'shift' table schema:
 * - id: UUID (primary key)
 * - teamId: UUID (foreign key to team)
 * - title: string
 * - eventDay: smallint (day of event, e.g. 0 for first day)
 * - startTime: time (without timezone)
 * - durationHours: smallint
 * - minVolunteers: smallint
 * - maxVolunteers: smallint
 * - isActive: boolean
 * - createdAt: timestamptz
 * - updatedAt: timestamptz
 *
 * 'requirement' table schema:
 * - id: UUID (primary key)
 * - shiftId: UUID (foreign key to shift)
 * - qualificationId: UUID (foreign key to qualification)
 * - createdAt: timestamptz
 * - updatedAt: timestamptz
 *
 * @since 2026-02-28
 * @author Michael Townsend <@continuities>
 */

import pool from '@/db';
import { stringToTime } from '@/utils/datetime';
import { PoolClient } from 'pg';
import { cache } from 'react';

const rowToShift = (row: any): ShiftInfo => ({
  id: row.id,
  teamId: row.teamId,
  title: row.title,
  eventDay: row.eventDay,
  startTime: stringToTime(row.startTime),
  durationHours: row.durationHours,
  minVolunteers: row.minVolunteers,
  maxVolunteers: row.maxVolunteers,
  isActive: row.isActive,
  requirement: row.qualificationId || undefined
});

const rowsToShifts = (rows: any[]): ShiftInfo[] => {
  const shiftsMap = new Map<ShiftId, ShiftInfo>();

  rows.forEach((row) => {
    if (!shiftsMap.has(row.id)) {
      shiftsMap.set(row.id, rowToShift(row));
    }

    const shift = shiftsMap.get(row.id)!;

    if (row.qualificationId) {
      // Right now, we only support one requirement per shift
      shift.requirement = row.qualificationId;
    }
  });

  return Array.from(shiftsMap.values());
};

const SHIFT_QUERY = `
  SELECT 
    s."id",
    s."teamId", 
    s."title", 
    s."eventDay", 
    s."startTime", 
    s."durationHours",
    s."minVolunteers",
    s."maxVolunteers",
    s."isActive",
    r."qualificationId"
  FROM shift s
  LEFT JOIN requirement r ON s.id = r."shiftId"
`;

/**
 * Fetches a shift by its ID from the database.
 * @param shiftId - The ID of the shift to fetch.
 * @return A ShiftInfo object if found, or null if no shift with the given ID exists.
 */
export const getShiftById = cache(async (shiftId: ShiftId): Promise<ShiftInfo | null> => {
  const result = await pool.query(
    `
    ${SHIFT_QUERY}
    WHERE s.id = $1`,
    [shiftId]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return rowToShift(result.rows[0]);
});

/**
 * Fetches a list of all shifts from the database.
 * @param teamId - The ID of the team to fetch shifts for.
 * @return An array of ShiftInfo objects.
 */
export const getShiftsForTeam = cache(async (teamId: TeamId): Promise<ShiftInfo[]> => {
  const result = await pool.query(
    `
    ${SHIFT_QUERY}
    WHERE "teamId" = $1`,
    [teamId]
  );
  return rowsToShifts(result.rows);
});

/**
 * Fetches a list of shifts for multiple teams from the database.
 * @param teamIds - An array of team IDs to fetch shifts for.
 * @return An object mapping team IDs to arrays of ShiftInfo objects.
 */
export const getShiftsForTeams = cache(
  async (teamIds: TeamId[]): Promise<Record<TeamId, ShiftInfo[]>> => {
    if (teamIds.length === 0) {
      return {};
    }
    const result = await pool.query(
      `
      ${SHIFT_QUERY}
      WHERE "teamId" = ANY($1)
      ORDER BY s."eventDay", s."startTime"
      `,
      [teamIds]
    );
    const shifts = rowsToShifts(result.rows);
    const shiftsByTeam = shifts.reduce(
      (acc, shift) => {
        if (!acc[shift.teamId]) {
          acc[shift.teamId] = [];
        }
        acc[shift.teamId].push(shift);
        return acc;
      },
      {} as Record<TeamId, ShiftInfo[]>
    );
    return shiftsByTeam;
  }
);

/**
 * Fetches a list of shifts for a given team, filtered by the provided criteria.
 * @param teamId - The ID of the team to fetch shifts for.
 * @param filters - A ShiftFilters object
 * @return An array of ShiftInfo objects that match the filter criteria.
 */
export const getFilteredShiftsForTeam = cache(
  async (teamId: TeamId, filters: ShiftFilters): Promise<ShiftInfo[]> => {
    const { searchQuery } = filters;

    const params = [teamId];
    const whereClauses = [`"teamId" = $${params.length}`];
    if (searchQuery) {
      params.push(`%${searchQuery}%`);
      whereClauses.push(`s."title" ILIKE $${params.length}`);
    }

    const result = await pool.query(
      `
      ${SHIFT_QUERY}
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY s."eventDay", s."startTime"
      `,
      params
    );
    return rowsToShifts(result.rows);
  }
);

/**
 * Fetches a list of all shifts for a given event
 * @param eventId - The ID of the event to fetch shifts for.
 * @return An array of ShiftInfo objects.
 */
export const getShiftsForEvent = cache(async (eventId: EventId): Promise<ShiftInfo[]> => {
  const result = await pool.query(
    `
    ${SHIFT_QUERY}
    JOIN team t ON s."teamId" = t.id
    WHERE t."eventId" = $1
    ORDER BY s."eventDay", s."startTime"
    `,
    [eventId]
  );
  return rowsToShifts(result.rows);
});

/**
 * Creates a new shift in the database.
 * @param shift - The shift data, excluding the ID.
 * @param client - Optional database client for transaction support.
 * @return The newly created ShiftInfo object, including its ID.
 */
export const createShift = async (
  shift: Omit<ShiftInfo, 'id'>,
  client?: PoolClient
): Promise<ShiftInfo> => {
  const db = client || pool;
  const result = await db.query(
    `
    INSERT INTO shift (
      "teamId",
      "title",
      "eventDay",
      "startTime",
      "durationHours",
      "minVolunteers",
      "maxVolunteers",
      "isActive"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      "id",
      "teamId",
      "title",
      "eventDay",
      "startTime",
      "durationHours",
      "minVolunteers",
      "maxVolunteers",
      "isActive"
    `,
    [
      shift.teamId,
      shift.title,
      shift.eventDay,
      shift.startTime,
      shift.durationHours,
      shift.minVolunteers,
      shift.maxVolunteers,
      shift.isActive
    ]
  );
  const newShift = rowToShift(result.rows[0]);
  if (shift.requirement) {
    await db.query(
      `
      INSERT INTO requirement (
        "shiftId",
        "qualificationId"
      ) VALUES ($1, $2)
      `,
      [newShift.id, shift.requirement]
    );
    newShift.requirement = shift.requirement;
  }
  console.info('Created new shift:', newShift);
  return newShift;
};

/**
 * Updates an existing shift in the database.
 * @param shift - The shift data to update, including its ID.
 * @param client - Optional database client for transaction support.
 * @returns The updated ShiftInfo object.
 */
export const updateShift = async (shift: ShiftInfo, client?: PoolClient): Promise<ShiftInfo> => {
  const db = client || pool;
  const result = await db.query(
    `
    UPDATE shift SET 
      "title" = $2,
      "eventDay" = $3,
      "startTime" = $4,
      "durationHours" = $5,
      "minVolunteers" = $6,
      "maxVolunteers" = $7,
      "isActive" = $8,
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING
      "id",
      "teamId",
      "title",
      "eventDay",
      "startTime",
      "durationHours",
      "minVolunteers",
      "maxVolunteers",
      "isActive"
    `,
    [
      shift.id,
      shift.title,
      shift.eventDay,
      shift.startTime,
      shift.durationHours,
      shift.minVolunteers,
      shift.maxVolunteers,
      shift.isActive
    ]
  );
  const updatedShift = rowToShift(result.rows[0]);
  if (shift.requirement) {
    // We currently only support one requirement per shift, so we can use an upsert to simplify logic
    await db.query(
      `
      INSERT INTO requirement (
        "shiftId",
        "qualificationId"
      ) VALUES ($1, $2)
      ON CONFLICT ("shiftId")
      DO UPDATE SET
        "qualificationId" = EXCLUDED."qualificationId",
        "updatedAt" = NOW()
      `,
      [updatedShift.id, shift.requirement]
    );
    updatedShift.requirement = shift.requirement;
  } else {
    // If no requirement is provided, delete any existing requirement for this shift
    await db.query(
      `
      DELETE FROM requirement
      WHERE "shiftId" = $1
      `,
      [updatedShift.id]
    );
  }
  console.info('Updated shift:', updatedShift);
  return updatedShift;
};

/**
 * Deletes an shift from the database.
 * @param shiftId - The ID of the shift to delete.
 * @param client - Optional database client for transaction support.
 */
export const deleteShift = async (shiftId: ShiftId, client?: PoolClient): Promise<void> => {
  const db = client || pool;
  // Requirements will be automatically deleted due to ON DELETE CASCADE
  await db.query('DELETE FROM shift WHERE id = $1', [shiftId]);
  console.info('Deleted shift with id:', shiftId);
};

/**
 * Gets a lock for a particular shift
 * @param shiftId - The ID of the shift to lock on
 * @param client - database client for transaction support
 */
export const getShiftLock = async (shiftId: ShiftId, client: PoolClient): Promise<void> => {
  await client.query(`SELECT id FROM shift WHERE id = $1 FOR UPDATE`, [shiftId]);
};

/**
 * Gets the number of volunteers signed up for a shift
 * @param shiftId - The ID of the shift
 * @param client - Optional database client for transaction support
 * @returns The number of volunteers signed up
 */
export const getShiftSignupCount = async (
  shiftId: ShiftId,
  client?: PoolClient
): Promise<number> => {
  const db = client || pool;
  const result = await db.query(
    `
    SELECT COUNT(*) FROM shift_volunteer WHERE shift_id = $1
    `,
    [shiftId]
  );
  return parseInt(result.rows[0].count, 10);
};

/**
 * Adds a volunteer to a shift in the database
 * @param shiftId - The ID of the shift to add the volunteer to.
 * @param volunteerId - The ID of the volunteer to add to the shift.
 * @param client - Optional database client for transaction support.
 */
export const addVolunteerToShift = async (
  shiftId: ShiftId,
  volunteerId: UserId,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
  await db.query(
    `
    INSERT INTO shift_volunteer (
      "shift_id",
      "user_id"
    ) VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [shiftId, volunteerId]
  );
};

/**
 * Removes a volunteer from a shift in the database
 * @param shiftId - The ID of the shift to remove the volunteer from.
 * @param volunteerId - The ID of the volunteer to remove from the shift.
 * @param client - Optional database client for transaction support.
 */
export const removeVolunteerFromShift = async (
  shiftId: ShiftId,
  volunteerId: UserId,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
  await db.query(
    `
    DELETE FROM shift_volunteer
    WHERE "shift_id" = $1 AND "user_id" = $2
    `,
    [shiftId, volunteerId]
  );
};

/**
 * Fetches a list of shifts that a given volunteer is signed up for.
 * @param eventId - The ID of the event to fetch shifts for.
 * @param volunteerId - The ID of the volunteer to fetch shifts for.
 * @return An array of ShiftInfo objects that the volunteer is signed up for.
 */
export const getShiftsForVolunteer = cache(
  async (eventId: EventId, volunteerId: UserId): Promise<ShiftInfo[]> => {
    console.info(`Fetching shifts for volunteer ${volunteerId} in event ${eventId}`);
    const result = await pool.query(
      `
    ${SHIFT_QUERY}
    JOIN shift_volunteer sv ON s.id = sv.shift_id
    WHERE sv.user_id = $1
    AND s."teamId" IN (
      SELECT id FROM team WHERE "eventId" = $2
    )
    ORDER BY s."eventDay", s."startTime"
    `,
      [volunteerId, eventId]
    );
    return rowsToShifts(result.rows);
  }
);

/**
 * Fetches a list of shifts for multiple volunteers in a given event.
 * @param volunteerIds - An array of volunteer IDs to fetch shifts for.
 * @params filter - An object containing optional filters
 * @params filter.event - An EventInfo object to filter shifts by event
 * @params filter.team - A TeamInfo object to filter shifts by team
 * @return An object mapping volunteer IDs to arrays of ShiftInfo objects
 */
export const getShiftsForVolunteers = cache(
  async (
    volunteerIds: UserId[],
    filter: { event?: EventInfo; team?: TeamInfo }
  ): Promise<Record<UserId, ShiftInfo[]>> => {
    if (volunteerIds.length === 0) {
      return {};
    }

    const values: any[] = [volunteerIds];
    const filterClauses = [];
    if (filter?.event) {
      values.push(filter.event.id);
      filterClauses.push(
        `
          AND s."teamId" IN (
            SELECT id FROM team WHERE "eventId" = $${values.length}
          )
        `
      );
    }
    if (filter?.team) {
      values.push(filter.team.id);
      filterClauses.push(`AND s."teamId" = $${values.length}`);
    }

    const result = await pool.query(
      `
    SELECT 
      s."id",
      s."teamId", 
      s."title", 
      s."eventDay", 
      s."startTime", 
      s."durationHours",
      s."minVolunteers",
      s."maxVolunteers",
      s."isActive",
      r."qualificationId",
      sv."user_id"
    FROM shift s
    LEFT JOIN requirement r ON s.id = r."shiftId"
    JOIN shift_volunteer sv ON s.id = sv.shift_id
    WHERE sv.user_id = ANY($1)
    ${filterClauses.join(' ')}
    ORDER BY s."eventDay", s."startTime"
    `,
      values
    );
    const shifts = rowsToShifts(result.rows);
    const shiftMap = new Map<ShiftId, ShiftInfo>(shifts.map((s) => [s.id, s]));
    const volunteerShifts: Record<UserId, ShiftInfo[]> = {};
    for (const row of result.rows) {
      const volunteerId = row.user_id;
      if (!volunteerShifts[volunteerId]) {
        volunteerShifts[volunteerId] = [];
      }
      const shift = shiftMap.get(row.id);
      if (shift) {
        volunteerShifts[volunteerId].push(shift);
      }
    }
    return volunteerShifts;
  }
);

/**
 * Fetches the total number of hours a given volunteer is signed up for in a given event.
 * @param eventId - The ID of the event to fetch hours for.
 * @param volunteerIds - An array of volunteer IDs to fetch hours for.
 * @return An object mapping volunteer IDs to total hours signed up for.
 */
export const getHoursForVolunteers = cache(
  async (eventId: EventId, volunteerIds: UserId[]): Promise<Record<UserId, number>> => {
    if (volunteerIds.length === 0) {
      return {};
    }

    const result = await pool.query(
      `
      SELECT
      sv.user_id,
      SUM(s."durationHours") AS total_hours
      FROM shift_volunteer sv
      JOIN shift s ON sv.shift_id = s.id
      WHERE sv.user_id = ANY($1)
      AND s."teamId" IN (
        SELECT id FROM team WHERE "eventId" = $2
      )
      GROUP BY sv.user_id
      `,
      [volunteerIds, eventId]
    );
    const hours: Record<UserId, number> = {};
    for (const row of result.rows) {
      hours[row.user_id] = parseInt(row.total_hours, 10);
    }
    return hours;
  }
);
