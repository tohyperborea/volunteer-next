/**
 * Utility functions for handling EventFilters
 * @since 2026-04-03
 * @author Michael Townsend <@continuities>
 */

import { normalise } from './list';

/**
 * Converts URLSearchParams to a EventFilters object
 * @param searchParams URLSearchParams from the request or current URL
 * @returns EventFilters object constructed from the search parameters
 */
export function paramsToEventFilters(searchParams: URLSearchParams): EventFilters {
  return {
    searchQuery: searchParams.get('searchQuery') || undefined,
    showArchived: searchParams.get('showArchived') === 'true' || false
  };
}

/**
 * Converts a record of string values (like from Next.js page props) to a EventFilters object
 * @param record A searchParams record like nextjs pageprops provides
 * @returns EventFilters object constructed from the record
 */
export function recordToEventFilters(
  record: Record<string, string | string[] | undefined>
): EventFilters {
  const searchQuery = normalise(record['searchQuery'])?.trim();
  return {
    searchQuery: searchQuery === '' ? undefined : searchQuery,
    showArchived: record['showArchived'] === 'true'
  };
}

/**
 * Converts a EventFilters object to URLSearchParams
 * @param filters EventFilters object to convert to URLSearchParams
 * @param existing Optional existing URLSearchParams to merge with (useful for preserving other params)
 * @returns
 */
export function EventFiltersToParams(
  filters: EventFilters,
  existing?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(existing);
  if (filters.searchQuery) {
    params.set('searchQuery', filters.searchQuery);
  } else {
    params.delete('searchQuery');
  }
  if (filters.showArchived) {
    params.set('showArchived', 'true');
  } else {
    params.delete('showArchived');
  }
  return params;
}
