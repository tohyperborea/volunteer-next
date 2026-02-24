/**
 * Simple component to display a time span, e.g. "9:00am - 5:00pm"
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Text } from '@radix-ui/themes';
import { ClockIcon } from '@radix-ui/react-icons';

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
};

interface Props {
  start: Date;
  end: Date;
}

export default function TimeSpan({ start, end }: Props) {
  const startTime = start.toLocaleTimeString([], TIME_OPTIONS);
  const endTime = end.toLocaleTimeString([], TIME_OPTIONS);
  return (
    <Flex asChild align="center" gap="2">
      <Text>
        <ClockIcon /> {startTime} - {endTime}
      </Text>
    </Flex>
  );
}
