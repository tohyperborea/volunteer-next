/**
 * EventForm component for creating or editing events.
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

'use client';

import { Flex, Text, TextField, Select, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from '../datepicker';
import { EVENT_SLUG_PATTERN } from '@/validator/event-validator';
import ImageSelector from '../image-selector';
import { FormField } from '../form-dialog';

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
  backOnCancel?: boolean;
  organiserOptions: VolunteerInfo[];
  editingEvent?: EventInfo;
  editingOrganiser?: VolunteerInfo;
}

export default function EventForm({
  onSubmit,
  onUpload,
  backOnCancel,
  organiserOptions,
  editingEvent,
  editingOrganiser
}: Props) {
  const t = useTranslations('EventForm');
  const router = useRouter();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const today = new Date().toISOString().split('T')[0];
  const minEndDate = startDate?.length ? startDate : today;
  return (
    <Flex asChild direction="column" align="start" gap="6">
      <form action={onSubmit}>
        {editingEvent && <input type="hidden" name="id" value={editingEvent.id} />}
        <Flex direction="column" gap="4">
          <FormField
            name={t('eventName')}
            description={t('eventNameDescription')}
            ariaId="event-name-label"
          >
            <TextField.Root
              name="name"
              aria-labelledby="event-name-label"
              id="event-name"
              placeholder={t('eventName')}
              autoComplete="off"
              defaultValue={editingEvent?.name}
              required
            />
          </FormField>
          <FormField
            name={t('eventSlug')}
            description={t('eventSlugDescription')}
            ariaId="event-slug-label"
          >
            <TextField.Root
              name="slug"
              aria-labelledby="event-slug-label"
              id="event-slug"
              placeholder={t('eventSlug')}
              autoComplete="off"
              defaultValue={editingEvent?.slug}
              pattern={EVENT_SLUG_PATTERN}
              required
            />
          </FormField>
          <FormField
            name={t('startDate')}
            description={t('startDateDescription')}
            ariaId="start-date-label"
          >
            <DatePicker
              name="startDate"
              id="start-date"
              aria-labelledby="start-date-label"
              placeholder={t('startDate')}
              min={today}
              max={endDate}
              onChange={(value) => setStartDate(value)}
              defaultValue={editingEvent?.startDate.toISOString().split('T')[0]}
              required
            />
          </FormField>
          <FormField
            name={t('endDate')}
            description={t('endDateDescription')}
            ariaId="end-date-label"
          >
            <DatePicker
              name="endDate"
              id="end-date"
              aria-labelledby="end-date-label"
              placeholder={t('endDate')}
              min={minEndDate}
              onChange={(value) => setEndDate(value)}
              defaultValue={editingEvent?.endDate.toISOString().split('T')[0]}
              required
            />
          </FormField>
          <FormField
            name={t('eventOrganiser')}
            description={t('eventOrganiserDescription')}
            ariaId="event-organiser-label"
          >
            <Select.Root required name="organiserId" defaultValue={editingOrganiser?.id}>
              <Select.Trigger placeholder={t('eventOrganiser')} />
              <Select.Content>
                {organiserOptions.map((volunteer) => (
                  <Select.Item key={volunteer.id} value={volunteer.id}>
                    {volunteer.displayName}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FormField>
          <FormField
            name={t('eventLogo')}
            description={t('eventLogoDescription')}
            ariaId="event-logo-label"
          >
            <ImageSelector name="logo" onSelect={onUpload} defaultValue={editingEvent?.logo} />
          </FormField>
          <FormField
            name={t('eventLogoDark')}
            description={t('eventLogoDarkDescription')}
            ariaId="event-logo-dark-label"
          >
            <ImageSelector
              name="logoDark"
              onSelect={onUpload}
              defaultValue={editingEvent?.logoDark}
            />
          </FormField>
          <FormField
            name={t('favicon')}
            description={t('faviconDescription')}
            ariaId="favicon-label"
          >
            <ImageSelector
              size="small"
              name="favicon"
              onSelect={onUpload}
              defaultValue={editingEvent?.favicon}
            />
          </FormField>

          <Flex gap="2" my="6">
            {backOnCancel && (
              <Button
                style={{ maxWidth: '284px', flexBasis: '40%', flexGrow: 1 }}
                variant="soft"
                color="gray"
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                }}
              >
                {t('cancelButton')}
              </Button>
            )}
            <Button
              variant="soft"
              style={{ maxWidth: '284px', flexBasis: '40%', flexGrow: 1 }}
              type="submit"
            >
              {t(editingEvent ? 'updateButton' : 'createButton')}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}
