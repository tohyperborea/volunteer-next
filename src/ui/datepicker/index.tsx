/**
 * Simple datepicker component
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { TextField } from '@radix-ui/themes';
import styles from './styles.module.css';

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
  name: string;
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
