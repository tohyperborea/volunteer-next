import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NavSquare from '@/ui/navSquare';
import NavRectangle from '@/ui/navRectangle';

const PAGE_KEY = 'EventDashboardPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug } = params;
    const event = !eventSlug ? null : await getEventBySlug(eventSlug);
    return event?.name ?? '';
  }
});

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function EventPage({ params }: Props) {
  const t = await getTranslations(PAGE_KEY);
  const { eventSlug } = await params;
  const event = eventSlug ? await getEventBySlug(eventSlug) : null;

  if (!event) {
    notFound();
  }

  return (
    <Flex direction="column" gap="8" p="4" style={{ width: '100%' }}>
      {/* nav square row */}
      <Flex style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <NavSquare>
          <Flex direction="column" align="center">
            <Text>{t('yourHours')}</Text>
            <Text size="6" weight="bold">
              00
            </Text>
          </Flex>
        </NavSquare>
        <NavSquare>
          <Flex direction="column" align="center">
            <Text>{t('yourShifts')}</Text>
            <Text size="6" weight="bold">
              None
            </Text>
          </Flex>
        </NavSquare>
      </Flex>
      <NavRectangle>
        <Text id="foo" size="6">
          {t('findShifts')}
        </Text>
      </NavRectangle>
    </Flex>
  );
}
