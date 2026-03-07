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

// API paths
export const getUserApiPath = (filter?: UserFilters): string =>
  `/api/user${filter ? `?${new URLSearchParams(filter as Record<string, string>).toString()}` : ''}`;
