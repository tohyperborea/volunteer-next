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
  onSubmit?: (data: FormData) => Promise<never>;
  filter?: UserFilters;
}

export default function VolunteerPicker({ title, open, onClose, onSubmit, filter }: Props) {
  const t = useTranslations('VolunteerPicker');
  const [volunteers, setVolunteers] = useState<User[]>([]);

  const fetchVolunteers = async () => {
    const response = await fetch(getUserApiPath(filter));
    if (!response.ok) {
      console.error('Failed to fetch volunteers:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data as User[];
  };

  useEffect(() => {
    if (open) {
      fetchVolunteers().then(setVolunteers);
    }
  }, [filter, open]);

  return (
    <FormDialog description={title} open={open} onClose={onClose}>
      <Flex direction="column" height="100%">
        <Dialog.Title as="h2" mt="4" mb="6">
          {title}
        </Dialog.Title>
        <SearchBar />
        <CheckboxCards.Root defaultValue={['id-1', 'id-2']} mt="4" name="volunteers">
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
