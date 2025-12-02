/**
 * Service for managing teams in the database
 * @since 2025-11-12
 * @author Jason Offet <@joffet>
 */

import pool from '@/db';
import { cache } from 'react';

const rowToTeam = (row: any): TeamInfo => ({
  id: row.id,
  name: row.name,
  eventId: row.eventId
});

/**
 * Fetches a list of all teams from the database.
 * @return An array of TeamInfo objects.
 */
export const getTeams = cache(async (): Promise<TeamInfo[]> => {
  const result = await pool.query('SELECT id, name, "eventId" FROM team');
  return result.rows.map(rowToTeam);
});
