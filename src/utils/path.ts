/**
 * Utilities for working with page urls and paths.
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

// Teams paths
export const getTeamInfoPath = (eventSlug: string, teamSlug: string): string =>
  `/event/${eventSlug}/team/${teamSlug}`;
export const getTeamShiftsPath = (eventSlug: string, teamSlug: string): string =>
  `${getTeamInfoPath(eventSlug, teamSlug)}/shifts`;
export const getTeamVolunteersPath = (eventSlug: string, teamSlug: string): string =>
  `${getTeamInfoPath(eventSlug, teamSlug)}/volunteers`;

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
