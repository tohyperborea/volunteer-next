import metadata from '@/i18n/metadata';
import { getEvents } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';

export const generateMetadata = metadata('EventsDashboard');

export default async function EventsDashboard() {
  await checkAuthorisation([{ type: 'admin' }]);

  const t = await getTranslations('EventsDashboard');
  const events = await getEvents();

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Box>
        <Link href="/create-event">
          <Button>
            <PlusIcon /> {t('createEvent')}
          </Button>
        </Link>
      </Box>
      {events.length === 0 && (
        <Card>
          <Text>{t('noEvents')}</Text>
        </Card>
      )}
      {events.map((event) => (
        <Card key={event.id}>
          <Heading size="4">{event.name}</Heading>
          <Text>TODO: event details?</Text>
        </Card>
      ))}
    </Flex>
  );
}
