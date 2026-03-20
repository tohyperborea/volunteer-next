/**
 * Utilities for working with page urls and paths.
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

import { userFiltersToParams } from './user-filters';

// Users paths
export const getUsersDashboardPath = (): string => '/user';
export const getCreateUserPath = (): string => '/create-user';
export const getEditUserPath = (userId: string, callbackUrl?: string): string =>
  `/update-user/${userId}${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
export const getUserProfilePath = (userId: string): string => `/user/${userId}`;

// Teams paths
export const getTeamsPath = (eventSlug: string): string => `/event/${eventSlug}/team`;
export const getTeamShiftsPath = (eventSlug: string, teamSlug: string): string =>
  `${getTeamsPath(eventSlug)}/${teamSlug}`;
export const getTeamVolunteersPath = (eventSlug: string, teamSlug: string): string =>
  `${getTeamShiftsPath(eventSlug, teamSlug)}/volunteers`;
export const getUpdateTeamPath = (eventSlug: string, teamId: string): string =>
  `/event/${eventSlug}/update-team/${teamId}`;
export const getCreateTeamPath = (eventSlug: string): string => `/event/${eventSlug}/create-team`;

// Qualifications paths
export const getQualificationsPath = (eventSlug: string) => `/event/${eventSlug}/qualification`;
export const getQualificationDetailsPath = ({
  eventSlug,
  qualificationId
}: {
  eventSlug: string;
  qualificationId: string;
}) => `/event/${eventSlug}/qualification/${qualificationId}`;

// Event-level paths
export const getEventShiftsPath = (eventSlug: string): string => `/event/${eventSlug}/shifts`;

// API paths
export const getEventShiftsApiPath = (
  eventSlug: string,
  params?: { format: 'csv' | 'json' }
): string => `/api/event/${eventSlug}/shifts?format=${params?.format ?? 'json'}`;
export const getTeamShiftsApiPath = (
  eventSlug: string,
  teamSlug: string,
  params?: { format: 'csv' | 'json' }
): string => `/api/event/${eventSlug}/team/${teamSlug}/shifts?format=${params?.format ?? 'json'}`;
export const getVolunteerShiftsApiPath = (
  eventSlug: string,
  userId: UserId,
  params?: { format: 'csv' | 'json' }
): string =>
  `/api/event/${eventSlug}/volunteer/${userId}/shifts?format=${params?.format ?? 'json'}`;
export const getUserApiPath = (filter?: UserFilters, params?: { format: 'csv' | 'json' }): string =>
  `/api/user?format=${params?.format ?? 'json'}${filter ? `&${userFiltersToParams(filter).toString()}` : ''}`;
export const getTeamVolunteersApiPath = (
  eventSlug: string,
  teamSlug: string,
  params?: { format: 'csv' | 'json' }
): string =>
  `/api/event/${eventSlug}/team/${teamSlug}/volunteers?format=${params?.format ?? 'json'}`;
