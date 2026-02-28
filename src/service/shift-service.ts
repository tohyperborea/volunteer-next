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

/**
 * Fetches a list of all shifts from the database.
 * @param teamId - The ID of the team to fetch shifts for.
 * @return An array of ShiftInfo objects.
 */
export const getShifts = cache(async (teamId: TeamId): Promise<ShiftInfo[]> => {
  const result = await pool.query(
    `
    SELECT 
      "id",
      "teamId", 
      "title", 
      "eventDay", 
      "startTime", 
      "durationHours",
      "minVolunteers",
      "maxVolunteers",
      "isActive"
    FROM shift
    WHERE "teamId" = $1`,
    [teamId]
  );
  return result.rows.map(rowToShift);
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
  await db.query('DELETE FROM shift WHERE id = $1', [shiftId]);
  console.info('Deleted shift with id:', shiftId);
};
