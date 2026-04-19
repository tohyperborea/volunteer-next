import metadata from '@/i18n/metadata';
import { archiveEvent, deleteEvent, getFilteredEvents } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import EventCard from '@/ui/event-card';
import NextLink from 'next/link';
import { revalidatePath } from 'next/cache';
import { getCreateEventPath, getEventsPath } from '@/utils/path';
import { hasEventEnded, hasEventStarted } from '@/utils/date';
import { unauthorized } from 'next/navigation';
import { recordToEventFilters } from '@/utils/event-filters';
import EventFilters from '@/ui/event-filters';

const PAGE_KEY = 'EventsManagementPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventsDashboard({ searchParams }: PageProps<`/events`>) {
  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser' }]);

  const filters = recordToEventFilters(await searchParams);
  const t = await getTranslations(PAGE_KEY);
  const events = await getFilteredEvents(filters);

  const deleteAction = async (id: EventId) => {
    'use server';
    const event = events.find((e) => e.id === id);
    if (!event) {
      return;
    }
    if (hasEventStarted(event)) {
      unauthorized();
    }
    await checkAuthorisation([{ type: 'admin' }]);
    await deleteEvent(id);
    revalidatePath(getEventsPath());
  };

  const archiveAction = async (id: EventId, archived: boolean) => {
    'use server';
    const event = events.find((e) => e.id === id);
    if (!event) {
      return;
    }
    if (!hasEventEnded(event)) {
      unauthorized();
    }
    await checkAuthorisation([{ type: 'admin' }]);
    await archiveEvent(id, archived);
    revalidatePath(getEventsPath());
  };

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('title')}</Heading>
      <Box>
        <Button variant="soft" asChild>
          <NextLink href={getCreateEventPath()}>
            <PlusIcon /> {t('createEvent')}
          </NextLink>
        </Button>
      </Box>
      <EventFilters withFilters={['searchQuery', 'showArchived']} />
      {events.length === 0 && (
        <Card>
          <Text>{t('noEvents')}</Text>
        </Card>
      )}
      {events.map((event) => (
        <EventCard
          event={event}
          onDelete={!hasEventStarted(event) ? deleteAction : undefined}
          onArchive={hasEventEnded(event) ? archiveAction : undefined}
          key={event.id}
          asLink
        />
      ))}
    </Flex>
  );
}
