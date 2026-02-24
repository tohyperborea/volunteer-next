import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import LinkCard, { LinkCardContent, LinkCardList } from '@/ui/link-card';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'EventPage';

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
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{event.name}</Heading>
      <LinkCardList>
        <LinkCard href={`/event/${eventSlug}/team`}>
          <LinkCardContent pretext={t('manageMy')} text={t('teams')} />
        </LinkCard>
        <LinkCard href="">
          <LinkCardContent pretext={t('manageMy')} text={t('volunteers')} />
        </LinkCard>
      </LinkCardList>
    </Flex>
  );
}
