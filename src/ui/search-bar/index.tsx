/**
 * Search bar component
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface Props {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({ defaultValue, onChange }: Props) {
  const t = useTranslations('SearchBar');
  return (
    <TextField.Root
      placeholder={t('placeholder')}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.currentTarget.value)}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon role="img" />
      </TextField.Slot>
    </TextField.Root>
  );
}
