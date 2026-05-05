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
//Helper functions for Displaying Overnight and multi-day shifts
const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC'
};

const isSameDisplayDay = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], TIME_OPTIONS);

const formatDateTime = (date: Date) =>
  date.toLocaleString([], DATE_TIME_OPTIONS);

interface Props {
  start: Date | TimeString;
  end: Date | TimeString;
}

export default function TimeSpan({ start, end }: Props) {
  const bothAreDates = start instanceof Date && end instanceof Date;
  const multiDay = bothAreDates && !isSameDisplayDay(start, end);

 const startTime =
    start instanceof Date
      ? formatTime(start)
      : stringToTime(start);

  const endTime =
    end instanceof Date
      ? multiDay
        ? formatDateTime(end)
        : formatTime(end)
      : stringToTime(end);

  return (
    <Flex asChild align="center" gap="2">
      <Text>
        <ClockIcon /> {startTime} - {endTime}
      </Text>
    </Flex>
  );
}
