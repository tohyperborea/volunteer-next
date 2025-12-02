/**
 * Application global type definitions
 * Put all your type definitions here so we can access them everywhere
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

export type UserId = string;
export type EventId = string;
export type TeamId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  roles: UserRole[];
}

/* These align with the role_type enum in the database
 * If you change this, you must also change the role_type enum in psql */
export type UserRole =
  // Global platform-wide control
  | { type: 'admin' }

  //Full control over all event specific data, users, and settings
  | { type: 'organiser'; eventId: EventId }

  // Manage volunteers and shifts in assigned area
  | { type: 'team-lead'; eventId: EventId; teamId: TeamId };

export interface EventInfo {
  id: EventId;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface TeamInfo {
  id: TeamId;
  name: string;
  eventId: EventId;
}
