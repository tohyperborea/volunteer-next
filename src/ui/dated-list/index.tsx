/**
 * List of items grouped by date, with a header for each date.
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

import { getListByDate } from '@/utils/date';
import { Flex, Text } from '@radix-ui/themes';

interface Props<T> {
  items: T[];
  getDate: (item: T) => Date;
  dateSize?: '1' | '2' | '3' | '4';
  dateWeight?: 'regular' | 'medium' | 'bold' | 'light';
  renderItem: (item: T) => React.ReactNode;
}

export default function DatedList<T>({
  items,
  getDate,
  renderItem,
  dateSize = '3',
  dateWeight = 'bold'
}: Props<T>) {
  const itemsByDate = getListByDate(items, getDate);
  return (
    <Flex direction="column" gap="4">
      {Object.entries(itemsByDate).map(([date, items]) => (
        <Flex key={date} direction="column" gap="4">
          <Text size={dateSize} weight={dateWeight}>
            {date}
          </Text>
          <Flex direction="column" gap="2">
            {items.map(renderItem)}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
