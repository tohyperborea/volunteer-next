/**
 * Simple datepicker component
 * @since 2026-02-27
 * @author Michael Townsend <@continuities>
 */

'use client';

import { TextField } from '@radix-ui/themes';
import styles from './styles.module.css';

const dateToString = (date: Date | string) =>
  date instanceof Date ? date.toISOString().split('T')[0] : date;

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
  required = false
}: Props) {
  return (
    <TextField.Root
      className={styles.dateInput}
      name={name}
      id={id}
      aria-labelledby={ariaLabelledBy}
      type="date"
      placeholder={placeholder}
      min={min && dateToString(min)}
      max={max && dateToString(max)}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      defaultValue={defaultValue && dateToString(defaultValue)}
      required={required}
    />
  );
}
