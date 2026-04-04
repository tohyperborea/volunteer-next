/**
 * Event card component
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

'use client';

import { useTranslations } from 'next-intl';
import { Badge, Flex, Text } from '@radix-ui/themes';
import MenuCard from '@/ui/menu-card';
import { getUpdateEventPath } from '@/utils/path';
import { EventCookie, getCookie, setCookie } from '@/utils/cookie';
import EventLink from '../event-link';
import { hasEventEnded, hasEventStarted } from '@/utils/date';

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
  onArchive?: (id: EventId, archived: boolean) => Promise<void>;
  asLink?: boolean;
}
export default function EventCard({ event, onDelete, asLink, onArchive }: Props) {
  const t = useTranslations('EventCard');
  const editable = !hasEventStarted(event);
  const archiveable = onArchive && hasEventEnded(event);

  const titleContent = (
    <Flex gap="3" align="center">
      <Text>{event.name}</Text>
      {event.archived && (
        <Badge variant="soft" color="gray" size="1">
          {t('archived')}
        </Badge>
      )}
    </Flex>
  );

  return (
    <MenuCard
      title={event.name}
      titleNode={
        asLink ? (
          <EventLink highContrast underline="none" href={'/'} eventId={event.id} key={event.id}>
            {titleContent}
          </EventLink>
        ) : (
          titleContent
        )
      }
      updateUri={editable ? getUpdateEventPath(event.id) : undefined}
      onArchive={archiveable && !event.archived ? () => onArchive(event.id, true) : undefined}
      onUnarchive={archiveable && event.archived ? () => onArchive(event.id, false) : undefined}
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
