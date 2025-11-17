/**
 * Service for managing teams in the database
 * @since 2025-11-16
 * @author Michael Townsend <@continuities>
 */

import pool from '@/db';
import { cache } from 'react';

const rowToTeam = (row: any): TeamInfo => ({
  id: row.id,
  eventId: row.event_id,
  slug: row.slug,
  name: row.name,
  description: row.description
});

/**
 * Get a team by its slug within a specific event
 * @param eventSlug - The url slug of the event
 * @param teamSlug - The url slug of the team
 * @returns The team information or null if not found
 */
export const getTeamBySlug = cache(
  async (eventSlug: UrlSlug, teamSlug: UrlSlug): Promise<TeamInfo | null> => {
    const res = await pool.query(
      `SELECT t.id, t."eventId", t.slug, t.name, t.description
       FROM teams t
       JOIN events e ON t.event_id = e.id
       WHERE e.slug = $1 AND t.slug = $2`,
      [eventSlug, teamSlug]
    );
    if (res.rowCount === 0) {
      return null;
    }
    return rowToTeam(res.rows[0]);
  }
);

/**
 * Delete a team by its ID
 * @param id - The ID of the team to delete
 * @returns A promise that resolves when the team is deleted
 */
export const deleteTeam = cache(async (id: TeamId): Promise<void> => {
  await pool.query('DELETE FROM teams WHERE id = $1', [id]);
});
