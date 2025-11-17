/**
 * Service for managing teams in the database
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

import pool from '@/db';
import { PoolClient } from 'pg';
import { cache } from 'react';

const rowToTeam = (row: any): TeamInfo => ({
  id: row.id,
  eventId: row.eventId,
  slug: row.slug,
  name: row.name,
  description: row.description
});

/**
 * Get all teams for a specific event
 * @param eventId - The ID of the event
 * @returns A list of teams associated with the event
 */
export const getTeamsForEvent = cache(async (eventId: EventId): Promise<TeamInfo[]> => {
  const res = await pool.query(
    `SELECT id, "eventId", slug, name, description
     FROM team
     WHERE "eventId" = $1`,
    [eventId]
  );
  return res.rows.map(rowToTeam);
});

/**
 * Get a team by its slug within a specific event
 * @param eventSlug - The url slug of the event
 * @param teamSlug - The url slug of the team
 * @returns The team information or null if not found
 */
export const getTeamBySlug = cache(
  async (eventSlug: UrlSlug, teamSlug: UrlSlug): Promise<TeamInfo | null> => {
    const result = await pool.query(
      `SELECT t.id, t."eventId", t.slug, t.name, t.description
       FROM team t
       JOIN event e ON t."eventId" = e.id
       WHERE e.slug = $1 AND t.slug = $2`,
      [eventSlug, teamSlug]
    );
    if (result.rowCount === 0) {
      return null;
    }
    return rowToTeam(result.rows[0]);
  }
);

/**
 * Get a team by its ID
 * @param id - The ID of the team
 * @returns The team information or null if not found
 */
export const getTeamById = cache(async (id: TeamId): Promise<TeamInfo | null> => {
  const result = await pool.query(
    `SELECT id, "eventId", slug, name, description
       FROM team
       WHERE id = $1`,
    [id]
  );
  if (result.rowCount === 0) {
    return null;
  }
  return rowToTeam(result.rows[0]);
});

/**
 * Create a new team in the database
 * @param team - The team information to create, minus id
 * @param client - Optional database client for transaction
 * @returns The created team information, with id populated
 */
export const createTeam = cache(
  async (team: Omit<TeamInfo, 'id'>, client?: PoolClient): Promise<TeamInfo> => {
    const db = client || pool;
    const result = await db.query(
      `INSERT INTO team ("eventId", slug, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, "eventId", slug, name, description`,
      [team.eventId, team.slug, team.name, team.description]
    );
    return rowToTeam(result.rows[0]);
  }
);

/**
 * Update an existing team in the database
 * @param team - The team information to update
 * @param client - Optional database client for transaction
 * @returns The updated team information
 */
export const updateTeam = cache(async (team: TeamInfo, client?: PoolClient): Promise<TeamInfo> => {
  const db = client || pool;
  const result = await db.query(
    `UPDATE team
       SET "eventId" = $1,
           slug = $2,
           name = $3,
           description = $4
       WHERE id = $5
       RETURNING id, "eventId", slug, name, description`,
    [team.eventId, team.slug, team.name, team.description, team.id]
  );
  return rowToTeam(result.rows[0]);
});

/**
 * Delete a team by its ID
 * @param id - The ID of the team to delete
 * @returns A promise that resolves when the team is deleted
 */
export const deleteTeam = cache(async (id: TeamId): Promise<void> => {
  await pool.query('DELETE FROM team WHERE id = $1', [id]);
});
