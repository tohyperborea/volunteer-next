/**
 * Service for managing events in the database
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import pool from '@/db';
import { PoolClient } from 'pg';
import { cache } from 'react';

/**
 * Fetches a list of all teams for a given team from the database.
 * @param teamId - The unique identifier of the team.
 * @return An array of TeamInfo objects.
 */
export const getTeams = cache(async (): Promise<TeamInfo[]> => {
  const result = await pool.query('SELECT id, name FROM team');
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    eventId: row.event_id
  }));
});

/**
 * Fetches a specific team by its ID.
 * @param teamId - The unique identifier of the team.
 * @return The TeamInfo object if found, or null if not found.
 */
export const getTeamById = cache(async (teamId: TeamId): Promise<TeamInfo | null> => {
  const result = await pool.query('SELECT id, name FROM team WHERE id = $1', [teamId]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    eventId: row.event_id
  };
});

/**
 * Creates a new team in the database.
 * @param team - The team data, excluding the ID.
 * @param client - Optional database client for transaction support.
 * @return The newly created TeamInfo object, including its ID.
 */
export const createTeam = async (
  team: Omit<TeamInfo, 'id'>,
  client?: PoolClient
): Promise<TeamInfo> => {
  const db = client || pool;
  const result = await db.query(
    'INSERT INTO team (name, event_id) VALUES ($1, $2) RETURNING id, name, event_id',
    [team.name, team.eventId]
  );
  const row = result.rows[0];
  const newTeam = {
    id: row.id,
    name: row.name,
    eventId: row.event_id
  };
  console.info('Created new team:', newTeam);
  return newTeam;
};
