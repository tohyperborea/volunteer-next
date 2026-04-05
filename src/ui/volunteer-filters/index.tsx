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
import SlideIn from '../slide-in';
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
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery || '');
  const [hoursFilter, setHoursFilter] = useState<string>(
    currentFilters.eventHours ? String(currentFilters.eventHours) : ''
  );
  const pathname = usePathname();
  const { replace } = useRouter();
  const debouncedEventHoursChange = useDebouncedCallback((value) => {
    onFiltersChange([
      ['eventHours', value || undefined],
      ['eventId', value ? currentEventId : undefined]
    ]);
  }, 500);
  const debouncedSearchQueryChange = useDebouncedCallback((value) => {
    onFilterChange('searchQuery', value || undefined);
  }, 500);

  useEffect(() => {
    setHoursFilter(currentFilters.eventHours ? String(currentFilters.eventHours) : '');
  }, [currentFilters.eventHours]);
  useEffect(() => {
    setSearchQuery(currentFilters.searchQuery || '');
  }, [currentFilters.searchQuery]);

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
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            debouncedSearchQueryChange(value);
          }}
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
            <SlideIn>
              <Card variant="classic">
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
                          value={hoursFilter}
                          min={0}
                          step={1}
                          onChange={(e) => {
                            setHoursFilter(e.currentTarget.value);
                            debouncedEventHoursChange(e.currentTarget.value);
                          }}
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
            </SlideIn>
          )}
        </Flex>
      )}
    </Flex>
  );
}
