/**
 * Application global type definitions
 * Put all your type definitions here so we can access them everywhere
 * @author Michael Townsend <@continuities>
 * @since 2025-11-10
 */

import type { AppRoutes } from '../../../../.next/types/routes';

declare global {
  type FormSubmitAction = (data: FormData) => Promise<void>;
  type PagePropsWithSearch<T extends AppRoutes, S> = Omit<PageProps<T>, 'searchParams'> & {
    searchParams: Promise<S>;
  };
  type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
  type PartialWithRequired<T, R extends keyof T> = Partial<T> & Pick<T, R>;
  type OptionalKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never;
  }[keyof T];
  type SendEmailResult =
    | {
        status: 'sent';
      }
    | {
        status: 'queued';
      }
    | {
        status: 'failed';
        error: string;
      };

  interface EmailCustomisation {
    subject: string;
    body: string;
    includeShifts: boolean;
  }

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

  /* Objects of this type contain PII and should NEVER be sent to the client, with the exception of currentUser
   * Convert to a VolunteerInfo object using @/lib/volunteer.ts */
  interface User {
    id: UserId;
    name: string;
    chosenName: string;
    email: string;
    roles: UserRole[];
    deletedAt?: Date;
  }
  type UserCreationModel = Omit<User, 'id' | 'roles' | 'chosenName'> &
    Partial<Pick<User, 'chosenName'>>;
  type UserUpdateModel = Omit<User, 'roles' | 'chosenName'> & Partial<Pick<User, 'chosenName'>>;

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

  type PermissionsProfile = {
    userId: UserId;
  } & {
    [K in UserRoleType]: boolean;
  };

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
    contactAddress: string;
  }

  interface UserFilters {
    roleType?: UserRoleType;
    searchQuery?: string;
    showDeleted?: boolean;
    withQualification?: QualificationId;
    withoutQualification?: QualificationId;
    onTeam?: TeamId;
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

  interface TeamFilters {
    searchQuery?: string;
  }

  interface ShiftFilters {
    searchQuery?: string;
  }

  type ThemeMode = 'light' | 'dark' | 'system';

  interface CookieConfig {
    name: string;
    maxAge?: number; // in seconds
  }

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

  interface VolunteerInfo {
    id: UserId;
    displayName: string;

    /* Only included if the requesting user has permission to see it */
    roles?: UserRole[];
    email?: string;
    fullName?: string;
  }
}
