import metadata from '@/i18n/metadata';
import { getTeamBySlug } from '@/service/team-service';
import { Flex, Heading, Card, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PAGE_KEY = 'TeamPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { eventSlug, teamSlug } = params;
    const team = !eventSlug || !teamSlug ? null : await getTeamBySlug(eventSlug, teamSlug);
    return team?.name ?? '';
  }
});

interface Props {
  params: Promise<{ eventSlug: string; teamSlug: string }>;
}

export default async function TeamPage({ params }: Props) {
  const t = await getTranslations(PAGE_KEY);
  const { eventSlug, teamSlug } = await params;
  const team = eventSlug && teamSlug ? await getTeamBySlug(eventSlug, teamSlug) : null;

  if (!team) {
    notFound();
  }

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{team.name}</Heading>
      <Card>
        <Text>{team.description}</Text>
      </Card>
    </Flex>
  );
}
