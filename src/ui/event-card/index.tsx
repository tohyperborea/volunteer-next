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

const localeOptions: Intl.DateTimeFormatOptions = {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short'
};

interface Props {
  event: EventInfo;
  onDelete: (id: EventId) => Promise<void>;
}
export default function EventCard({ event, onDelete }: Props) {
  const t = useTranslations('EventCard');

  return (
    <MenuCard
      title={event.name}
      updateUri={getUpdateEventPath(event.id)}
      onDelete={async () => {
        await onDelete(event.id);
        if (getCookie(EventCookie.name) === event.id) {
          setCookie(EventCookie, '');
        }
      }}
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
