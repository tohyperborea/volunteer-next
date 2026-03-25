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
export const getTeamsPath = (): string => `/team`;
export const getTeamShiftsPath = (teamSlug: string): string => `${getTeamsPath()}/${teamSlug}`;
export const getTeamVolunteersPath = (teamSlug: string): string =>
  `${getTeamShiftsPath(teamSlug)}/volunteers`;
export const getUpdateTeamPath = (teamId: string): string => `/update-team/${teamId}`;
export const getCreateTeamPath = (): string => `/create-team`;

// Qualifications paths
export const getQualificationsPath = () => `/qualification`;
export const getQualificationDetailsPath = (qualificationId: string) =>
  `/qualification/${qualificationId}`;

// Event paths
export const getEventsPath = () => '/events';
export const getCreateEventPath = () => '/create-event';
export const getUpdateEventPath = (eventId: string) => `/update-event/${eventId}`;
export const getEventShiftsPath = (): string => `/shifts`;

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
export const getUserApiPath = (
  filter?: UserFilters,
  params?: { format: 'csv' | 'json' }
): string => {
  const fullParams = filter ? userFiltersToParams(filter) : new URLSearchParams();
  fullParams.set('format', params?.format ?? 'json');
  return `/api/user?${fullParams.toString()}`;
};
export const getTeamVolunteersApiPath = (
  eventSlug: string,
  teamSlug: string,
  params?: { format: 'csv' | 'json' }
): string =>
  `/api/event/${eventSlug}/team/${teamSlug}/volunteers?format=${params?.format ?? 'json'}`;
