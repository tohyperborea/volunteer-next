import metadata from '@/i18n/metadata';
import { deleteEvent, getEvents } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import EventCard from '@/ui/event-card';
import NextLink from 'next/link';
import { revalidatePath } from 'next/cache';
import EventLink from '@/ui/event-link';
import { getCreateEventPath, getEventsPath } from '@/utils/path';
import { EventCookie, getCookie, setCookie } from '@/utils/cookie';

const PAGE_KEY = 'EventsManagementPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventsDashboard() {
  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser' }]);

  const t = await getTranslations(PAGE_KEY);
  const events = await getEvents();

  const deleteAction = async (id: EventId) => {
    'use server';
    await checkAuthorisation([{ type: 'admin' }]);
    await deleteEvent(id);
    if (getCookie(EventCookie.name) === id) {
      setCookie(EventCookie, '');
    }
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
        <EventLink highContrast underline="none" href={'/'} eventId={event.id} key={event.id}>
          <EventCard event={event} onDelete={deleteAction} />
        </EventLink>
      ))}
    </Flex>
  );
}
