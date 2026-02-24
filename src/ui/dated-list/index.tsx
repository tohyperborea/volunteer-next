/**
 * List of items grouped by date, with a header for each date.
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use server';

import { Flex, Text } from '@radix-ui/themes';

interface Props<T> {
  items: T[];
  getDate: (item: T) => Date;
  renderItem: (item: T) => React.ReactNode;
}

export default async function DatedList<T>({ items, getDate, renderItem }: Props<T>) {
  const sortedItems = [...items].sort((a, b) => getDate(a).getTime() - getDate(b).getTime());
  const itemsByDate = sortedItems.reduce(
    (acc, item) => {
      const date = getDate(item).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
  return (
    <Flex direction="column" gap="4">
      {Object.entries(itemsByDate).map(([date, items]) => (
        <Flex key={date} direction="column" gap="4">
          <Text>{date}</Text>
          <Flex direction="column" gap="2">
            {items.map(renderItem)}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
