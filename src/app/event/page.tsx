import metadata from '@/i18n/metadata';
import { getEvents } from '@/service/event-service';
import { Heading, Flex } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = metadata('EventsDashboard');

export default async function EventsDashboard() {
  const t = await getTranslations('EventsDashboard');
  const events = await getEvents();

  return (
    <Flex dir="column" gap="4" p="4">
      <Heading>{t('title')}</Heading>
    </Flex>
  );
}
