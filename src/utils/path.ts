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
