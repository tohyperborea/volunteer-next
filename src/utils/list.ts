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
