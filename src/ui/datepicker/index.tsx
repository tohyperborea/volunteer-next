/**
 * Simple datepicker component
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { TextField } from '@radix-ui/themes';
import styles from './styles.module.css';
import { dateToEventDay, eventDayTimeToDate } from '@/utils/datetime';
import { useState } from 'react';

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

type EventDayTimePickerProps = {
  startDate: Date;
  defaultValue?: EventDayTime;
} & Omit<Props, 'defaultValue' | 'timepicker'>;

/**
 * A special date and time picker that works with an event's start date and event day/time format.
 * It renders two hidden inputs for the event day and time, named {name}-day and {name}-time respectively.
 */
export function EventDayTimePicker({
  startDate,
  defaultValue,
  onChange,
  name,
  ...rest
}: EventDayTimePickerProps) {
  const defaultDate =
    defaultValue && eventDayTimeToDate(startDate, defaultValue.day, defaultValue.time);
  const [dayTime, setDayTime] = useState<EventDayTime | undefined>(defaultValue);
  return (
    <>
      <DatePicker
        {...rest}
        defaultValue={defaultDate}
        timepicker
        onChange={(value) => {
          const day = dateToEventDay(startDate, new Date(value));
          const time = value.slice(11, 16) as TimeString;
          if (!isNaN(day) && time) {
            setDayTime({
              day: dateToEventDay(startDate, new Date(value)),
              time: value.slice(11, 16) as TimeString
            });
          }
          onChange && onChange(value);
        }}
      />
      <input type="hidden" name={`${name}-day`} value={dayTime?.day ?? ''} />
      <input type="hidden" name={`${name}-time`} value={dayTime?.time ?? ''} />
    </>
  );
}
