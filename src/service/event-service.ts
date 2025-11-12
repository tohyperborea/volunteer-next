/**
 * Service for managing events in the database
 * @since 2025-11-12
 * @author Michael Townsend <@continuities>
 */

import db from '@/db';
import { cache } from 'react';

/**
 * Fetches a list of all events from the database.
 * @return An array of EventInfo objects.
 */
export const getEvents = cache(async (): Promise<EventInfo[]> => {
  const result = await db.query('SELECT id, name FROM event');
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name
  }));
});

/**
 * Fetches a specific event by its ID.
 * @param eventId - The unique identifier of the event.
 * @return The EventInfo object if found, or null if not found.
 */
export const getEventById = cache(async (eventId: EventId): Promise<EventInfo | null> => {
  const result = await db.query('SELECT id, name FROM event WHERE id = $1', [eventId]);
  if (result.rows.length === 0) {
    return null;
  }
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name
  };
});

/**
 * Creates a new event in the database.
 * @param event - The event data, excluding the ID.
 * @return The newly created EventInfo object, including its ID.
 */
export const createEvent = async (event: Omit<EventInfo, 'id'>): Promise<EventInfo> => {
  const result = await db.query('INSERT INTO event (name) VALUES ($1) RETURNING id, name', [
    event.name
  ]);
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name
  };
};
