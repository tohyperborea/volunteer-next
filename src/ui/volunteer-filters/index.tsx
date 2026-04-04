/**
 * Component for filtering volunteers based on various criteria.
 * @since 2026-03-16
 * @author Michael Townsend <@continuities>
 */

import { MixerVerticalIcon } from '@radix-ui/react-icons';
import { Flex, Button, Card, Select, Checkbox, Text, Box, TextField } from '@radix-ui/themes';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SearchBar from '../search-bar';
import { paramsToUserFilters } from '@/utils/user-filters';
import { useTranslations } from 'next-intl';
import { FormField } from '../form-dialog';
import styles from './styles.module.css';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  withFilters?: (keyof UserFilters)[];
  currentEventId?: EventId;
}

export default function VolunteerFilters({ currentEventId, withFilters = [] }: Props) {
  const t = useTranslations('VolunteerFilters');
  const hasFilter = new Set(withFilters);
  const showFilterPanel = hasFilter.difference(new Set(['searchQuery'])).size > 0;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentFilters = paramsToUserFilters(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  const debouncedEventHoursChange = useDebouncedCallback((value) => {
    onFiltersChange([
      ['eventHours', value || undefined],
      ['eventId', value ? currentEventId : undefined]
    ]);
  }, 500);

  const onFiltersChange = (changes: [keyof UserFilters, string | undefined][]) => {
    const params = new URLSearchParams(searchParams);
    for (const [filter, value] of changes) {
      if (value) {
        params.set(filter, value);
      } else {
        params.delete(filter);
      }
    }
    replace(`${pathname}${params.size > 0 ? `?${params.toString()}` : ''}`);
  };

  const onFilterChange = (filter: keyof UserFilters, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(filter, value);
    } else {
      params.delete(filter);
    }
    replace(`${pathname}${params.size > 0 ? `?${params.toString()}` : ''}`);
  };

  const onClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    for (const filter of withFilters) {
      params.delete(filter);
      if (filter === 'eventHours') {
        params.delete('eventId');
      }
    }
    replace(`${pathname}${params.size > 0 ? `?${params.toString()}` : ''}`);
  };

  return (
    <Flex direction="column" gap="2">
      {hasFilter.has('searchQuery') && (
        <SearchBar
          defaultValue={currentFilters.searchQuery}
          onChange={onFilterChange.bind(null, 'searchQuery')}
        />
      )}
      {showFilterPanel && (
        <Flex direction="column" gap="2">
          <Flex asChild justify="start">
            <Button
              variant="outline"
              color="gray"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <MixerVerticalIcon />
              {t('filters')}
            </Button>
          </Flex>
          {filtersOpen && (
            <Card variant="classic" className={styles.easeInTransition}>
              <Flex direction="column" gap="4">
                {hasFilter.has('roleType') && (
                  <FormField name={t('roleFilterLabel')} ariaId="roleFilter">
                    <Box>
                      <Select.Root
                        value={currentFilters.roleType ?? 'all'}
                        onValueChange={(value) =>
                          onFilterChange('roleType', value === 'all' ? undefined : value)
                        }
                      >
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="all">{t('allRoles')}</Select.Item>
                          <Select.Item value="admin">{t('admin')}</Select.Item>
                          <Select.Item value="organiser">{t('organiser')}</Select.Item>
                          <Select.Item value="team-lead">{t('teamLead')}</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </FormField>
                )}
                {hasFilter.has('eventHours') && currentEventId && (
                  <FormField name={t('eventHoursFilterLabel')} ariaId="eventHoursFilter">
                    <Box style={{ alignSelf: 'start' }}>
                      <TextField.Root
                        aria-label={t('eventHoursFilterLabel')}
                        placeholder={t('eventHoursPlaceholder')}
                        type="number"
                        defaultValue={currentFilters.eventHours}
                        min={0}
                        step={1}
                        onChange={(e) => debouncedEventHoursChange(e.currentTarget.value)}
                      />
                    </Box>
                  </FormField>
                )}
                {hasFilter.has('showDeleted') && (
                  <Text as="label" size="2">
                    <Flex align="center" gap="2">
                      <Checkbox
                        checked={currentFilters.showDeleted}
                        onCheckedChange={(checked) =>
                          onFilterChange('showDeleted', checked ? 'true' : undefined)
                        }
                      />
                      {t('showDeleted')}
                    </Flex>
                  </Text>
                )}
                <Box>
                  <Button variant="outline" color="blue" onClick={onClearFilters}>
                    {t('clear')}
                  </Button>
                </Box>
              </Flex>
            </Card>
          )}
        </Flex>
      )}
    </Flex>
  );
}
