import metadata from '@/i18n/metadata';
import { getEvents } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';

export const generateMetadata = metadata('EventsDashboard');

export default async function EventsDashboard() {
  const t = await getTranslations('EventsDashboard');
  const events = await getEvents();

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Box>
        <Button>
          <PlusIcon /> {t('createEvent')}
        </Button>
      </Box>
      {events.length === 0 && (
        <Card>
          <Text>{t('noEvents')}</Text>
        </Card>
      )}
      {events.map((event) => (
        <Card key={event.id}>
          <Heading size="4">{event.name}</Heading>
          <Text>TODO</Text>
        </Card>
      ))}
    </Flex>
  );
}
