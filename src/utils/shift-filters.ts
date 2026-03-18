/**
 * Utility functions for handling ShiftFilters
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

import { normalise } from './list';

/**
 * Converts URLSearchParams to a ShiftFilters object
 * @param searchParams URLSearchParams from the request or current URL
 * @returns ShiftFilters object constructed from the search parameters
 */
export function paramsToShiftFilters(searchParams: URLSearchParams): ShiftFilters {
  return {
    searchQuery: searchParams.get('searchQuery') || undefined
  };
}

/**
 * Converts a record of string values (like from Next.js page props) to a ShiftFilters object
 * @param record A searchParams record like nextjs pageprops provides
 * @returns ShiftFilters object constructed from the record
 */
export function recordToShiftFilters(
  record: Record<string, string | string[] | undefined>
): ShiftFilters {
  const searchQuery = normalise(record['searchQuery'])?.trim();
  return {
    searchQuery: searchQuery === '' ? undefined : searchQuery
  };
}

/**
 * Converts a ShiftFilters object to URLSearchParams
 * @param filters ShiftFilters object to convert to URLSearchParams
 * @param existing Optional existing URLSearchParams to merge with (useful for preserving other params)
 * @returns
 */
export function shiftFiltersToParams(
  filters: ShiftFilters,
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
