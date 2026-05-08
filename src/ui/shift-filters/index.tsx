/**
 * Component for filtering shifts based on various criteria.
 * @since 2026-03-17
 * @author Michael Townsend <@continuities>
 */

'use client';

import { MixerVerticalIcon } from '@radix-ui/react-icons';
import { Flex, Button, Card, Box, Select } from '@radix-ui/themes';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SearchBar from '../search-bar';
import { paramsToShiftFilters } from '@/utils/shift-filters';
import { useTranslations } from 'next-intl';
import { useDebouncedCallback } from 'use-debounce';
import { FormField } from '../form-dialog';

interface Props {
  withFilters?: (keyof ShiftFilters)[];
  teams?: TeamInfo[];
}

export default function ShiftFilters({ withFilters = [], teams = [] }: Props) {
  const t = useTranslations('ShiftFilters');
  const hasFilter = new Set(withFilters);
  const showFilterPanel = hasFilter.difference(new Set(['searchQuery'])).size > 0;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentFilters = paramsToShiftFilters(searchParams);
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery || '');
  useEffect(() => {
    setSearchQuery(currentFilters.searchQuery || '');
  }, [currentFilters.searchQuery]);
  const pathname = usePathname();
  const { replace } = useRouter();

  const debouncedSearchQueryChange = useDebouncedCallback((value) => {
    onFilterChange('searchQuery', value || undefined);
  }, 500);

  const onFilterChange = (filter: keyof ShiftFilters, value: string | undefined) => {
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
            <Card variant="classic">
              <Flex direction="column" gap="4">
                {hasFilter.has('teamId') && (
                  <FormField name={t('teamFilterLabel')} ariaId="teamFilter">
                    <Box>
                      <Select.Root
                        value={currentFilters.teamId ?? 'all'}
                        onValueChange={(value) =>
                          onFilterChange('teamId', value === 'all' ? undefined : value)
                        }
                      >
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="all">{t('allTeams')}</Select.Item>
                          <Select.Separator />
                          {teams.map((team) => (
                            <Select.Item key={team.id} value={team.id}>
                              {team.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </FormField>
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
