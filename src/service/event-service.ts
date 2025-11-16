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
  name: row.name,
  startDate: row.startDate,
  endDate: row.endDate
});

/**
 * Fetches a list of all events from the database.
 * @return An array of EventInfo objects.
 */
export const getEvents = cache(async (): Promise<EventInfo[]> => {
  const result = await pool.query('SELECT id, name, "startDate", "endDate" FROM event');
  return result.rows.map(rowToEvent);
});

/**
 * Fetches a specific event by its ID.
 * @param eventId - The unique identifier of the event.
 * @return The EventInfo object if found, or null if not found.
 */
export const getEventById = cache(async (eventId: EventId): Promise<EventInfo | null> => {
  const result = await pool.query(
    'SELECT id, name, "startDate", "endDate" FROM event WHERE id = $1',
    [eventId]
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
    'INSERT INTO event (name, "startDate", "endDate") VALUES ($1, $2, $3) RETURNING id, name, "startDate", "endDate"',
    [event.name, event.startDate.toISOString(), event.endDate.toISOString()]
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
    'UPDATE event SET name = $1, "startDate" = $2, "endDate" = $3 WHERE id = $4 RETURNING id, name, "startDate", "endDate"',
    [event.name, event.startDate.toISOString(), event.endDate.toISOString(), event.id]
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
