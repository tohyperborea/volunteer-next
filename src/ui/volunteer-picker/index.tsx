/**
 * Fullscreen dialog for selecting one or more volunteers
 * @since 2026-03-07
 * @author Michael Townsend <@continuities>
 */

'use client';

import FormDialog from '@/ui/form-dialog';
import { Button, CheckboxCards, Dialog, Flex } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import SearchBar from '../search-bar';
import { useEffect, useState } from 'react';
import { VolunteerCardContent } from '../volunteer-card';
import { getUserApiPath } from '@/utils/path';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  title: string;
  open?: boolean;
  onClose?: () => void;
  onSelect?: (volunteers: VolunteerInfo[]) => void;
  onSubmit?: FormSubmitAction;
  filter?: UserFilters;
  excludeIds?: UserId[];
}

export default function VolunteerPicker({
  title,
  open,
  onClose,
  onSelect,
  onSubmit,
  filter,
  excludeIds
}: Props) {
  const t = useTranslations('VolunteerPicker');
  const [volunteers, setVolunteers] = useState<VolunteerInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<Record<UserId, VolunteerInfo>>({});

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 500);

  const fetchVolunteers = async (searchQuery: string | undefined) => {
    const requestFilter: UserFilters | undefined = searchQuery
      ? { ...filter, searchQuery }
      : filter;
    const response = await fetch(getUserApiPath(requestFilter));
    if (!response.ok) {
      console.error('Failed to fetch volunteers:', response.statusText);
      return [];
    }
    const data: VolunteerInfo[] = await response.json();
    const excludedSet = new Set(excludeIds);
    return excludedSet.size > 0 ? data.filter((volunteer) => !excludedSet.has(volunteer.id)) : data;
  };

  useEffect(() => {
    if (open) {
      fetchVolunteers(search).then(setVolunteers);
      setSelected({});
    }
  }, [filter, search, open, excludeIds]);

  return (
    <FormDialog description={title} open={open} onClose={onClose}>
      <Flex direction="column" height="100%">
        <Dialog.Title as="h2" mt="4" mb="6">
          {title}
        </Dialog.Title>
        <SearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            debouncedSetSearch(value);
          }}
        />
        <CheckboxCards.Root columns="1" mt="4" name="volunteers">
          {volunteers.map((volunteer) => (
            <CheckboxCards.Item
              key={volunteer.id}
              value={volunteer.id}
              onClick={() => {
                setSelected((prev) => {
                  const newSelected = { ...prev };
                  if (newSelected[volunteer.id]) {
                    delete newSelected[volunteer.id];
                  } else {
                    newSelected[volunteer.id] = volunteer;
                  }
                  return newSelected;
                });
              }}
            >
              <VolunteerCardContent volunteer={volunteer} />
            </CheckboxCards.Item>
          ))}
        </CheckboxCards.Root>
        <Flex gap="4" mt="auto" py="4">
          <Dialog.Close>
            <Button color="gray" variant="soft">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button
            variant="soft"
            type={onSubmit ? 'submit' : 'button'}
            formAction={onSubmit}
            onClick={
              onSelect
                ? () => {
                    onSelect(Object.values(selected));
                  }
                : undefined
            }
          >
            {t('save')}
          </Button>
        </Flex>
      </Flex>
    </FormDialog>
  );
}
