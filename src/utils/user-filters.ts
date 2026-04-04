/**
 * Utility functions for handling UserFilters
 * @since 2026-03-16
 * @author Michael Townsend <@continuities>
 */

import { normalise } from './list';

/**
 * Converts URLSearchParams to a UserFilters object
 * @param searchParams URLSearchParams from the request or current URL
 * @returns UserFilters object constructed from the search parameters
 */
export function paramsToUserFilters(searchParams: URLSearchParams): UserFilters {
  return {
    roleType: (searchParams.get('roleType') as UserRoleType) || undefined,
    searchQuery: searchParams.get('searchQuery') || undefined,
    showDeleted: searchParams.get('showDeleted') === 'true' || false,
    withQualification: searchParams.get('withQualification') || undefined,
    withoutQualification: searchParams.get('withoutQualification') || undefined,
    onTeam: searchParams.get('onTeam') || undefined,
    eventHours: searchParams.get('eventHours') ? Number(searchParams.get('eventHours')) : undefined,
    eventId: searchParams.get('eventId') || undefined
  };
}

/**
 * Converts a record of string values (like from Next.js page props) to a UserFilters object
 * @param record A searchParams record like nextjs pageprops provides
 * @returns UserFilters object constructed from the record
 */
export function recordToUserFilters(
  record: Record<string, string | string[] | undefined>
): UserFilters {
  return {
    roleType: normalise(record['roleType']),
    searchQuery: normalise(record['searchQuery']),
    showDeleted: record['showDeleted'] === 'true',
    withQualification: normalise(record['withQualification']),
    withoutQualification: normalise(record['withoutQualification']),
    onTeam: normalise(record['onTeam']),
    eventHours: record['eventHours'] ? Number(record['eventHours']) : undefined,
    eventId: normalise(record['eventId'])
  };
}

/**
 * Converts a UserFilters object to URLSearchParams
 * @param filters UserFilters object to convert to URLSearchParams
 * @param existing Optional existing URLSearchParams to merge with (useful for preserving other params)
 * @returns
 */
export function userFiltersToParams(
  filters: UserFilters,
  existing?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(existing);
  if (filters.roleType) {
    params.set('roleType', filters.roleType);
  } else {
    params.delete('roleType');
  }
  if (filters.searchQuery) {
    params.set('searchQuery', filters.searchQuery);
  } else {
    params.delete('searchQuery');
  }
  if (filters.showDeleted) {
    params.set('showDeleted', 'true');
  } else {
    params.delete('showDeleted');
  }
  if (filters.withQualification) {
    params.set('withQualification', filters.withQualification);
  } else {
    params.delete('withQualification');
  }
  if (filters.withoutQualification) {
    params.set('withoutQualification', filters.withoutQualification);
  } else {
    params.delete('withoutQualification');
  }
  if (filters.onTeam) {
    params.set('onTeam', filters.onTeam);
  } else {
    params.delete('onTeam');
  }
  if (filters.eventHours !== undefined) {
    params.set('eventHours', String(filters.eventHours));
  } else {
    params.delete('eventHours');
  }
  if (filters.eventId) {
    params.set('eventId', filters.eventId);
  } else {
    params.delete('eventId');
  }
  return params;
}
