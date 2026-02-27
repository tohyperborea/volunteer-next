/**
 * Application global type definitions
 * Put all your type definitions here so we can access them everywhere
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

type UserId = string;
type EventId = string;
type TeamId = string;
type ShiftId = string;
type RequirementId = string;
type UrlSlug = string;

interface User {
  id: UserId;
  name: string;
  email: string;
  roles: UserRole[];
  deletedAt?: Date;
}

/* These align with the role_type enum in the database
 * If you change this, you must also change the role_type enum in psql */
type UserRole =
  // Global platform-wide control
  | { type: 'admin' }

  //Full control over all event specific data, users, and settings
  | { type: 'organiser'; eventId: EventId }

  // Manage volunteers and shifts in assigned area
  | { type: 'team-lead'; eventId: EventId; teamId: TeamId };

interface EventInfo {
  id: EventId;
  name: string;
  slug: UrlSlug;
  startDate: Date;
  endDate: Date;
}

interface TeamInfo {
  id: TeamId;
  name: string;
  eventId: EventId;
  slug: UrlSlug;
  description: string;
}

interface UserFilters {
  roleType?: string;
  searchQuery?: string;
  showDeleted?: boolean;
}

interface ShiftInfo {
  id: ShiftId;
  teamId: TeamId;
  name: string;
  startTime: Date;
  durationHours: number;
  minVolunteers: number;
  maxVolunteers: number;
  requirements?: RequirementId[];
  isActive: boolean;
}

type ThemeMode = 'light' | 'dark' | 'system';
