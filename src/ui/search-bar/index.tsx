/**
 * Search bar component
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  defaultValue?: string;
  onChange?: (value: string) => void;
  debounceDelay?: number;
}

export default function SearchBar({ defaultValue, onChange, debounceDelay = 500 }: Props) {
  const t = useTranslations('SearchBar');
  const debouncedOnChange = onChange ? useDebouncedCallback(onChange, debounceDelay) : undefined;
  return (
    <TextField.Root
      placeholder={t('placeholder')}
      defaultValue={defaultValue}
      onChange={(e) => debouncedOnChange?.(e.currentTarget.value)}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon role="img" />
      </TextField.Slot>
    </TextField.Root>
  );
}
