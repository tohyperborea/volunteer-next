/**
 * Application global type definitions
 * Put all your type definitions here so we can access them everywhere
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

type ServerAction = (data: FormData) => Promise<never>;

type PartialWithRequired<T, R extends keyof T> = Partial<T> & Pick<T, R>;

type UserId = string;
type EventId = string;
type TeamId = string;
type ShiftId = string;
type RequirementId = string;
type QualificationId = string;
type UrlSlug = string;
type TimeString = string; // ISO 8601 time string, e.g. "14:30"
type EventDay = number; // 0 for first day, 1 for second day, etc.

type EventDayTime = {
  day: EventDay;
  time: TimeString;
};

interface User {
  id: UserId;
  name: string;
  email: string;
  roles: UserRole[];
  deletedAt?: Date;
}

/* These align with the role_type enum in the database
 * If you change this, you must also change the role_type enum in psql */
type UserRoleType = 'admin' | 'organiser' | 'team-lead';
type UserRole =
  // Global platform-wide control
  | { type: 'admin' }

  //Full control over all event specific data, users, and settings
  | { type: 'organiser'; eventId: EventId }

  // Manage volunteers in assigned area
  | { type: 'team-lead'; eventId: EventId; teamId: TeamId };

type UserRoleMatchCriteria = PartialWithRequired<UserRole, 'type'>;

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
  roleType?: UserRoleType;
  searchQuery?: string;
  showDeleted?: boolean;
  withQualification?: QualificationId;
  withoutQualification?: QualificationId;
}

interface ShiftInfo {
  id: ShiftId;
  teamId: TeamId;
  isActive: boolean;
  title: string;
  eventDay: EventDay;
  startTime: TimeString;
  durationHours: number;
  minVolunteers: number;
  maxVolunteers: number;
  requirement?: QualificationId;
}

type ThemeMode = 'light' | 'dark' | 'system';

interface QualificationInfo {
  id: QualificationId;
  name: string;
  eventId: EventId;
  teamId?: TeamId;
  errorMessage: string;
}

interface ShiftRequirement {
  shiftId: ShiftId;
  qualificationId: QualificationId;
}
