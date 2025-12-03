/**
 * Event card component
 * @since 2025-11-14
 * @author Michael Townsend <@continuities>
 */

'use client';

import { useTranslations } from 'next-intl';
import { Text } from '@radix-ui/themes';
import MenuCard from '@/ui/menu-card';

interface Props {
  event: EventInfo;
  onDelete: (id: EventId) => Promise<void>;
}
export default function EventCard({ event, onDelete }: Props) {
  const t = useTranslations('EventCard');

  return (
    <MenuCard
      title={event.name}
      updateUri={`/update-event/${event.id}`}
      onDelete={() => onDelete(event.id)}
    >
      <Text size="1">
        {t('dateSpan', {
          startDate: event.startDate.toDateString(),
          endDate: event.endDate.toDateString()
        })}
      </Text>
    </MenuCard>
  );
}
