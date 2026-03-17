/**
 * Utility functions for working with lists of items
 * @since 2026-03-09
 * @author Michael Townsend <@continuities>
 */

/**
 *
 * @param list - The list of items to deduplicate
 * @param keyFn - A function that takes an item and returns a string key used for deduplication
 * @returns The deduplicated list of items
 */
export const deduplicateBy = <T>(list: T[], keyFn: (item: T) => string): T[] => {
  const seenKeys = new Set<string>();
  const deduplicatedList: T[] = [];
  for (const item of list) {
    const key = keyFn(item);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicatedList.push(item);
    }
  }
  return deduplicatedList;
};

/**
 * Normalises a value that may be a single string or an array of string to a single string
 * @param value - The value to normalise
 * @returns The normalised value
 */
export const normalise = <T extends string>(
  value: string | string[] | undefined
): T | undefined => {
  if (Array.isArray(value)) {
    return value[0] as T;
  }
  return value as T;
};
