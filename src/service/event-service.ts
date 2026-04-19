/**
 * Service for managing events in the database
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import pool from '@/db';
import { PoolClient } from 'pg';
import { cache } from 'react';

const rowToEvent = (row: any): EventInfo => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  startDate: row.startDate,
  endDate: row.endDate,
  archived: Boolean(row.archivedAt),
  logo: row.logo ?? undefined,
  logoDark: row.logo_dark ?? undefined,
  favicon: row.favicon ?? undefined
});

/**
 * Fetches a list of all events from the database.
 * @return An array of EventInfo objects.
 */
export const getEvents = cache(async (): Promise<EventInfo[]> => {
  const result = await pool.query(
    `
    SELECT 
      id, 
      name,
      "slug", 
      "startDate", 
      "endDate", 
      "archivedAt", 
      "logo", 
      "logo_dark", 
      "favicon" 
    FROM event
    ORDER BY "startDate" DESC
    `
  );
  return result.rows.map(rowToEvent);
});

export const getFilteredEvents = cache(async (filter: EventFilters): Promise<EventInfo[]> => {
  const filterConditions: string[] = [];
  const filterValues: any[] = [];

  if (filter.searchQuery) {
    filterValues.push(`%${filter.searchQuery}%`);
    filterConditions.push(`name ILIKE $${filterValues.length}`);
  }

  if (!filter.showArchived) {
    filterConditions.push(`"archivedAt" IS NULL`);
  }

  const result = await pool.query(
    `
    SELECT 
      id, 
      name,
      "slug", 
      "startDate",
      "endDate",
      "archivedAt",
      "logo",
      "logo_dark",
      "favicon"

    FROM event 
    ${filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : ''}
    `,
    filterValues
  );
  return result.rows.map(rowToEvent);
});

/**
 * Fetches a list of events that have not yet ended.
 * @returns An array of EventInfo objects.
 */
export const getActiveEvents = cache(async (): Promise<EventInfo[]> => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        "slug",
        "startDate",
        "endDate",
        "archivedAt",
        "logo",
        "logo_dark",
        "favicon"
        
      FROM event
      WHERE "endDate" >= CURRENT_DATE
      ORDER BY "startDate" ASC
    `
  );
  return result.rows.map(rowToEvent);
});

/**
 * Fetches events by ID.
 * @param eventIds - The event ids to fetch
 * @return An array of EventInfo objects matching the provided IDs.
 */
export const getEventsById = cache(async (eventIds: EventId[]): Promise<EventInfo[]> => {
  if (eventIds.length === 0) {
    return [];
  }
  const result = await pool.query(
    `SELECT id, name, "slug", "startDate", "endDate", "archivedAt", "logo", "logo_dark","favicon" FROM event WHERE id = ANY($1)`,
    [eventIds]
  );
  return result.rows.map(rowToEvent);
});

/**
 * Fetches a specific event by its slug.
 * @param slug - The slug identifier of the event.
 * @return The EventInfo object if found, or null if not found.
 */
export const getEventBySlug = cache(async (slug: string): Promise<EventInfo | null> => {
  const result = await pool.query(
    'SELECT id, name, "slug", "startDate", "endDate", "archivedAt", "logo", "logo_dark","favicon" FROM event WHERE "slug" = $1',
    [slug]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return rowToEvent(result.rows[0]);
});

/**
 * Creates a new event in the database.
 * @param event - The event data, excluding the ID.
 * @param client - Optional database client for transaction support.
 * @return The newly created EventInfo object, including its ID.
 */
export const createEvent = async (
  event: Omit<EventInfo, 'id'>,
  client?: PoolClient
): Promise<EventInfo> => {
  const db = client || pool;
  const result = await db.query(
    `
    INSERT INTO event (
      name, 
      "slug", 
      "startDate", 
      "endDate", 
      "logo", 
      "logo_dark", 
      "favicon"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING 
      id, 
      "slug", 
      name, 
      "startDate", 
      "endDate", 
      "logo", 
      "logo_dark",
      "favicon"`,
    [
      event.name,
      event.slug,
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      event.logo,
      event.logoDark,
      event.favicon
    ]
  );
  const newEvent = rowToEvent(result.rows[0]);
  console.info('Created new event:', newEvent);
  return newEvent;
};

/**
 * Updates an existing event in the database.
 * @param event - The event data to update, including its ID.
 * @param client - Optional database client for transaction support.
 * @returns The updated EventInfo object.
 */
export const updateEvent = async (event: EventInfo, client?: PoolClient): Promise<EventInfo> => {
  const db = client || pool;
  const result = await db.query(
    `UPDATE event 
    SET 
      name = $1, 
      "slug" = $2, 
      "startDate" = $3, 
      "endDate" = $4, 
      "logo" = $5, 
      "logo_dark" = $6,
      "favicon" = $7 
    WHERE id = $8 
    RETURNING 
      id, 
      name, 
      "slug", 
      "startDate", 
      "endDate", 
      "logo", 
      "logo_dark", 
      "favicon"`,
    [
      event.name,
      event.slug,
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      event.logo,
      event.logoDark,
      event.favicon,
      event.id
    ]
  );
  const updatedEvent = rowToEvent(result.rows[0]);
  console.info('Updated event:', updatedEvent);
  return updatedEvent;
};

/**
 * Deletes an event from the database.
 * @param eventId - The ID of the event to delete.
 * @param client - Optional database client for transaction support.
 */
export const deleteEvent = async (eventId: EventId, client?: PoolClient): Promise<void> => {
  const db = client || pool;
  await db.query('DELETE FROM event WHERE id = $1', [eventId]);
  console.info('Deleted event with id:', eventId);
};

/**
 * Archives or unarchives an event
 * @param eventId - The ID of the event to archive or unarchive.
 * @param archived - Whether to archive (true) or unarchive (false) the event.
 * @param client - Optional database client for transaction support.
 */
export const archiveEvent = async (
  eventId: EventId,
  archived: boolean,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool;
  if (archived) {
    await db.query('UPDATE event SET "archivedAt" = CURRENT_TIMESTAMP WHERE id = $1', [eventId]);
    console.info('Archived event with id:', eventId);
  } else {
    await db.query('UPDATE event SET "archivedAt" = NULL WHERE id = $1', [eventId]);
    console.info('Unarchived event with id:', eventId);
  }
};
