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
  isActive: row.isActive
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

/**
 * Fetches a list of all shifts from the database.
 * @param teamId - The ID of the team to fetch shifts for.
 * @return An array of ShiftInfo objects.
 */
export const getShifts = cache(async (teamId: TeamId): Promise<ShiftInfo[]> => {
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
      r."qualificationId"
    FROM shift s
    LEFT JOIN requirement r ON s.id = r."shiftId"
    WHERE "teamId" = $1`,
    [teamId]
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
