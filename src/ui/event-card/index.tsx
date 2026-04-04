/**
 * Event card component
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

'use client';

import { useTranslations } from 'next-intl';
import { Text } from '@radix-ui/themes';
import MenuCard from '@/ui/menu-card';
import { getUpdateEventPath } from '@/utils/path';
import { EventCookie, getCookie, setCookie } from '@/utils/cookie';
import EventLink from '../event-link';
import { hasEventStarted } from '@/utils/date';

const localeOptions: Intl.DateTimeFormatOptions = {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short'
};

interface Props {
  event: EventInfo;
  onDelete?: (id: EventId) => Promise<void>;
  asLink?: boolean;
}
export default function EventCard({ event, onDelete, asLink }: Props) {
  const t = useTranslations('EventCard');
  const editable = !hasEventStarted(event);
  return (
    <MenuCard
      title={event.name}
      titleNode={
        asLink ? (
          <EventLink highContrast underline="none" href={'/'} eventId={event.id} key={event.id}>
            {event.name}
          </EventLink>
        ) : undefined
      }
      updateUri={editable ? getUpdateEventPath(event.id) : undefined}
      onDelete={
        editable && onDelete
          ? async () => {
              await onDelete(event.id);
              if (getCookie(EventCookie.name) === event.id) {
                setCookie(EventCookie, '');
              }
            }
          : undefined
      }
    >
      <Text size="1">
        {t('dateSpan', {
          startDate: event.startDate.toLocaleDateString(undefined, localeOptions),
          endDate: event.endDate.toLocaleDateString(undefined, localeOptions)
        })}
      </Text>
    </MenuCard>
  );
}
