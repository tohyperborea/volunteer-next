import metadata from '@/i18n/metadata';
import { deleteEvent, getEvents } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import EventCard from '@/ui/event-card';
import NextLink from 'next/link';
import { revalidatePath } from 'next/cache';
import { getCreateEventPath, getEventsPath } from '@/utils/path';
import { hasEventStarted } from '@/utils/date';
import { unauthorized } from 'next/navigation';

const PAGE_KEY = 'EventsManagementPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventsDashboard() {
  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser' }]);

  const t = await getTranslations(PAGE_KEY);
  const events = await getEvents();

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

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('title')}</Heading>
      <Box>
        <Button asChild>
          <NextLink href={getCreateEventPath()}>
            <PlusIcon /> {t('createEvent')}
          </NextLink>
        </Button>
      </Box>
      {events.length === 0 && (
        <Card>
          <Text>{t('noEvents')}</Text>
        </Card>
      )}
      {events.map((event) => (
        <EventCard
          event={event}
          onDelete={!hasEventStarted(event) ? deleteAction : undefined}
          key={event.id}
          asLink
        />
      ))}
    </Flex>
  );
}
