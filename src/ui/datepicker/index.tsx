/**
 * Simple datepicker component
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Select, TextField } from '@radix-ui/themes';
import styles from './styles.module.css';
import { buildTime, dateToEventDay, eventDayToDate } from '@/utils/datetime';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const dateToString = (date: Date | string, includeTime: boolean) => {
  if (!(date instanceof Date)) {
    return date;
  }
  if (includeTime) {
    return date.toISOString().slice(0, 16);
  }
  return date.toISOString().split('T')[0];
};

interface Props {
  name?: string;
  id?: string;
  'aria-labelledby'?: string;
  placeholder?: string;
  min?: Date | string;
  max?: Date | string;
  defaultValue?: Date | string;
  onChange?: (value: string) => void;
  required?: boolean;
  timepicker?: boolean;
}

/**
 * A simple date picker component that works with Date objects
 */
export default function DatePicker({
  name,
  id,
  'aria-labelledby': ariaLabelledBy,
  placeholder,
  min,
  max,
  defaultValue,
  onChange,
  required = false,
  timepicker = false
}: Props) {
  return (
    <TextField.Root
      className={styles.dateInput}
      name={name}
      id={id}
      aria-labelledby={ariaLabelledBy}
      type={timepicker ? 'datetime-local' : 'date'}
      placeholder={placeholder}
      min={min && dateToString(min, timepicker)}
      max={max && dateToString(max, timepicker)}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      defaultValue={defaultValue && dateToString(defaultValue, timepicker)}
      required={required}
    />
  );
}

interface EventDaySelectProps {
  startDate: Date;
  defaultValue?: EventDay;
  onChange?: (eventDay: EventDay) => void;
  name?: string;
  required?: boolean;
  ariaLabel: string;
}

export function EventDaySelect({
  required,
  startDate,
  defaultValue,
  onChange,
  name,
  ariaLabel
}: EventDaySelectProps) {
  const defaultDate =
    defaultValue !== undefined ? eventDayToDate(startDate, defaultValue) : undefined;
  const [eventDay, setEventDay] = useState<EventDay | undefined>(defaultValue);
  const [day, setDay] = useState<number | undefined>(defaultDate && defaultDate.getUTCDate());
  const [month, setMonth] = useState<number | undefined>(defaultDate && defaultDate.getUTCMonth());
  const [year, setYear] = useState<number | undefined>(defaultDate && defaultDate.getUTCFullYear());

  const knowsDays = month !== undefined && year !== undefined;
  const daysInMonth = knowsDays ? new Date(year, month + 1, 0).getUTCDate() : 31;
  const currentYear = new Date().getUTCFullYear();

  const t = useTranslations('EventDaySelect');

  const dayLabel = (date: number): string => {
    if (knowsDays) {
      const dateObj = new Date(Date.UTC(year, month, date));
      return dateObj.toLocaleDateString('default', {
        weekday: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    }
    return date.toString();
  };

  useEffect(() => {
    if (day !== undefined && month !== undefined && year !== undefined) {
      const date = new Date(Date.UTC(year, month, day));
      const eventDay = dateToEventDay(startDate, date);
      setEventDay(eventDay);
      onChange && onChange(eventDay);
    }
  }, [day, month, year]);
  return (
    <Flex gap="2">
      <Select.Root
        required={required}
        value={day?.toString() ?? ''}
        onValueChange={(v) => setDay(parseInt(v, 10))}
      >
        <Select.Trigger placeholder="DD" aria-label={t('day', { parent: ariaLabel })} />
        <Select.Content>
          {Array.from({ length: daysInMonth }, (_, i) => (
            <Select.Item key={i} value={(i + 1).toString()}>
              {dayLabel(i + 1)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        required={required}
        value={month?.toString() ?? ''}
        onValueChange={(v) => setMonth(parseInt(v, 10))}
      >
        <Select.Trigger placeholder="MM" aria-label={t('month', { parent: ariaLabel })} />
        <Select.Content>
          {Array.from({ length: 12 }, (_, i) => (
            <Select.Item key={i} value={i.toString()}>
              {new Date(0, i).toLocaleString('default', { month: 'short' })}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        required={required}
        value={year?.toString() ?? ''}
        onValueChange={(v) => setYear(parseInt(v, 10))}
      >
        <Select.Trigger placeholder="YYYY" aria-label={t('year', { parent: ariaLabel })} />
        <Select.Content>
          {Array.from({ length: 10 }, (_, i) => (
            <Select.Item key={i} value={(currentYear + i).toString()}>
              {currentYear + i}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <input type="hidden" name={name} value={eventDay ?? ''} />
    </Flex>
  );
}

interface TimeSelectProps {
  name?: string;
  defaultValue?: TimeString;
  onChange?: (time: TimeString) => void;
  required?: boolean;
  ariaLabel: string;
}

export function TimeSelect({ name, defaultValue, onChange, required, ariaLabel }: TimeSelectProps) {
  const [defaultHour, defaultMinute] = defaultValue
    ? defaultValue.split(':').map((part) => parseInt(part, 10))
    : [undefined, undefined];
  const [hour, setHour] = useState<number | undefined>(defaultHour);
  const [minute, setMinute] = useState<number | undefined>(defaultMinute);
  const t = useTranslations('TimeSelect');
  return (
    <Flex gap="2">
      <Select.Root
        required={required}
        defaultValue={defaultHour?.toString()}
        onValueChange={(v) => {
          const newHour = parseInt(v, 10);
          setHour(newHour);
          if (minute !== undefined) {
            const newTime = buildTime(newHour, minute);
            onChange && onChange(newTime);
          }
        }}
      >
        <Select.Trigger placeholder="HH" aria-label={t('hour', { parent: ariaLabel })} />
        <Select.Content>
          {Array.from({ length: 24 }, (_, i) => (
            <Select.Item key={i} value={i.toString()}>
              {i.toString().padStart(2, '0')}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        required={required}
        defaultValue={defaultMinute?.toString()}
        onValueChange={(v) => {
          const newMinute = parseInt(v, 10);
          setMinute(newMinute);
          if (hour !== undefined) {
            const newTime = buildTime(hour, newMinute);
            onChange && onChange(newTime);
          }
        }}
      >
        <Select.Trigger placeholder="MM" aria-label={t('minute', { parent: ariaLabel })} />
        <Select.Content>
          {Array.from({ length: 4 }, (_, i) => (
            <Select.Item key={i} value={(i * 15).toString()}>
              {(i * 15).toString().padStart(2, '0')}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <input
        type="hidden"
        name={name}
        value={hour !== undefined && minute !== undefined ? buildTime(hour, minute) : ''}
      />
    </Flex>
  );
}
