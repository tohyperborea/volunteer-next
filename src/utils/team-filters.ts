/**
 * Utility functions for handling TeamFilters
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

import { normalise } from './list';

/**
 * Converts URLSearchParams to a TeamFilters object
 * @param searchParams URLSearchParams from the request or current URL
 * @returns TeamFilters object constructed from the search parameters
 */
export function paramsToTeamFilters(searchParams: URLSearchParams): TeamFilters {
  return {
    searchQuery: searchParams.get('searchQuery') || undefined
  };
}

/**
 * Converts a record of string values (like from Next.js page props) to a TeamFilters object
 * @param record A searchParams record like nextjs pageprops provides
 * @returns TeamFilters object constructed from the record
 */
export function recordToTeamFilters(
  record: Record<string, string | string[] | undefined>
): TeamFilters {
  const searchQuery = normalise(record['searchQuery'])?.trim();
  return {
    searchQuery: searchQuery === '' ? undefined : searchQuery
  };
}

/**
 * Converts a TeamFilters object to URLSearchParams
 * @param filters TeamFilters object to convert to URLSearchParams
 * @param existing Optional existing URLSearchParams to merge with (useful for preserving other params)
 * @returns
 */
export function teamFiltersToParams(
  filters: TeamFilters,
  existing?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(existing);
  if (filters.searchQuery) {
    params.set('searchQuery', filters.searchQuery);
  } else {
    params.delete('searchQuery');
  }
  return params;
}
