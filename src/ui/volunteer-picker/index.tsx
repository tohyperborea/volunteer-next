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

interface Props {
  title: string;
  open?: boolean;
  onClose?: () => void;
  onSubmit?: FormSubmitAction;
  filter?: UserFilters;
}

export default function VolunteerPicker({ title, open, onClose, onSubmit, filter }: Props) {
  const t = useTranslations('VolunteerPicker');
  const [volunteers, setVolunteers] = useState<VolunteerInfo[]>([]);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const fetchVolunteers = async (searchQuery: string | undefined) => {
    const requestFilter: UserFilters | undefined = searchQuery
      ? { ...filter, searchQuery }
      : filter;
    const response = await fetch(getUserApiPath(requestFilter));
    if (!response.ok) {
      console.error('Failed to fetch volunteers:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data as VolunteerInfo[];
  };

  useEffect(() => {
    if (open) {
      fetchVolunteers(search).then(setVolunteers);
    }
  }, [filter, search, open]);

  return (
    <FormDialog description={title} open={open} onClose={onClose}>
      <Flex direction="column" height="100%">
        <Dialog.Title as="h2" mt="4" mb="6">
          {title}
        </Dialog.Title>
        <SearchBar
          onChange={(value) => {
            setSearch(value);
          }}
        />
        <CheckboxCards.Root columns="1" mt="4" name="volunteers">
          {volunteers.map((volunteer) => (
            <CheckboxCards.Item key={volunteer.id} value={volunteer.id}>
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
          <Button variant="soft" formAction={onSubmit}>
            {t('save')}
          </Button>
        </Flex>
      </Flex>
    </FormDialog>
  );
}
