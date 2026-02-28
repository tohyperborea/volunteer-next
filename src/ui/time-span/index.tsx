/**
 * Simple component to display a time span, e.g. "9:00am - 5:00pm"
 * Doesn't do any timezone offsetting, since we're using "Z" to represent "event timezone".
 * @since 2026-02-24
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Text } from '@radix-ui/themes';
import { ClockIcon } from '@radix-ui/react-icons';
import { stringToTime } from '@/utils/datetime';

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC' // this is because we're using "Z" to represent "event timezone", so we want to display the time as-is without any timezone conversion
};

interface Props {
  start: Date | TimeString;
  end: Date | TimeString;
}

export default function TimeSpan({ start, end }: Props) {
  const startTime =
    start instanceof Date ? start.toLocaleTimeString([], TIME_OPTIONS) : stringToTime(start);
  const endTime =
    end instanceof Date ? end.toLocaleTimeString([], TIME_OPTIONS) : stringToTime(end);
  return (
    <Flex asChild align="center" gap="2">
      <Text>
        <ClockIcon /> {startTime} - {endTime}
      </Text>
    </Flex>
  );
}
