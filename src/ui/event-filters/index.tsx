/**
 * Component for filtering events based on various criteria.
 * @since 2026-04-03
 * @author Michael Townsend <@continuities>
 */

'use client';

import { MixerVerticalIcon } from '@radix-ui/react-icons';
import { Flex, Button, Card, Box, Text, Checkbox } from '@radix-ui/themes';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SearchBar from '../search-bar';
import { paramsToEventFilters } from '@/utils/event-filters';
import { useTranslations } from 'next-intl';
import SlideIn from '../slide-in';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  withFilters?: (keyof EventFilters)[];
}

export default function EventFilters({ withFilters = [] }: Props) {
  const t = useTranslations('EventFilters');
  const hasFilter = new Set(withFilters);
  const showFilterPanel = hasFilter.difference(new Set(['searchQuery'])).size > 0;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentFilters = paramsToEventFilters(searchParams);
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery || '');
  const pathname = usePathname();
  const { replace } = useRouter();
  const debouncedSearchQueryChange = useDebouncedCallback((value) => {
    onFilterChange('searchQuery', value || undefined);
  }, 500);

  useEffect(() => {
    setSearchQuery(currentFilters.searchQuery || '');
  }, [currentFilters.searchQuery]);

  const onFilterChange = (filter: keyof EventFilters, value: string | undefined) => {
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
            <SlideIn>
              <Card variant="classic">
                <Flex direction="column" gap="4">
                  {hasFilter.has('showArchived') && (
                    <Text as="label" size="2">
                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={currentFilters.showArchived}
                          onCheckedChange={(checked) =>
                            onFilterChange('showArchived', checked ? 'true' : undefined)
                          }
                        />
                        {t('showArchived')}
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
