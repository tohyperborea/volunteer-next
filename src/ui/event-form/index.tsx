/**
 * EventForm component for creating or editing events.
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Text, TextField, Select, Box, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import styles from './styles.module.css';
import { useState } from 'react';

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="1">
    {children}
  </Flex>
);

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  organiserOptions: User[];
  editingEvent?: EventInfo;
  editingOrganiser?: User;
}

export default function EventForm({
  onSubmit,
  organiserOptions,
  editingEvent,
  editingOrganiser
}: Props) {
  const t = useTranslations('EventForm');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const today = new Date().toISOString().split('T')[0];
  const minEndDate = startDate?.length ? startDate : today;
  return (
    <form action={onSubmit}>
      {editingEvent && <input type="hidden" name="id" value={editingEvent.id} />}
      <Flex direction="column" gap="4">
        <FormItem>
          <Text as="label" id="event-name-label" htmlFor="event-name" size="2" weight="bold">
            {t('eventName')}
          </Text>
          <TextField.Root
            name="name"
            aria-labelledby="event-name-label"
            id="event-name"
            placeholder={t('eventName')}
            autoComplete="off"
            defaultValue={editingEvent?.name}
            required
          />
        </FormItem>
        <FormItem>
          <Text as="label" id="start-date-label" htmlFor="start-date" size="2" weight="bold">
            {t('startDate')}
          </Text>
          <TextField.Root
            className={styles.dateInput}
            name="startDate"
            id="start-date"
            aria-labelledby="start-date-label"
            type="date"
            placeholder={t('startDate')}
            min={today}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            defaultValue={editingEvent?.startDate.toISOString().split('T')[0]}
            required
          />
        </FormItem>
        <FormItem>
          <Text as="label" id="end-date-label" htmlFor="end-date" size="2" weight="bold">
            {t('endDate')}
          </Text>
          <TextField.Root
            className={styles.dateInput}
            name="endDate"
            id="end-date"
            aria-labelledby="end-date-label"
            type="date"
            placeholder={t('endDate')}
            min={minEndDate}
            onChange={(e) => setEndDate(e.target.value)}
            defaultValue={editingEvent?.endDate.toISOString().split('T')[0]}
            required
          />
        </FormItem>
        <FormItem>
          <Text
            as="label"
            id="event-organiser-label"
            htmlFor="event-organiser"
            size="2"
            weight="bold"
          >
            {t('eventOrganiser')}
          </Text>
          <Select.Root required name="organiserId" defaultValue={editingOrganiser?.id}>
            <Select.Trigger placeholder={t('eventOrganiser')} />
            <Select.Content>
              {organiserOptions.map((user) => (
                <Select.Item key={user.id} value={user.id}>
                  {user.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </FormItem>
        <Box>
          <Button type="submit">{t(editingEvent ? 'updateButton' : 'createButton')}</Button>
        </Box>
      </Flex>
    </form>
  );
}
