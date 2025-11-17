import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import TeamCard from '@/ui/team-card';
import { notFound, redirect } from 'next/navigation';
import { deleteTeam } from '@/service/team-service';

const PAGE_KEY = 'TeamsDashboardPage';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const { locale, eventSlug } = params;
    const t = await getTranslations({ locale: locale ?? '', namespace: PAGE_KEY });
    const event = !eventSlug ? null : await getEventBySlug(eventSlug);
    return t('teamsForEvent', { eventName: event?.name ?? '' });
  }
});

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export default async function EventsDashboard({ params }: Props) {
  const t = await getTranslations(PAGE_KEY);

  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  const teams: TeamInfo[] = []; // TODO

  const deleteAction = async (id: TeamId) => {
    'use server';
    await checkAuthorisation([{ type: 'admin' }]);
    await deleteTeam(id);
    redirect('/event');
  };

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('teamsForEvent', { eventName: event.name })}</Heading>
      <Box>
        <Link href={`/event/${eventSlug}/create-team`}>
          <Button>
            <PlusIcon /> {t('createTeam')}
          </Button>
        </Link>
      </Box>
      {teams.length === 0 && (
        <Card>
          <Text>{t('noTeams')}</Text>
        </Card>
      )}
      {teams.map((team) => (
        <Link
          highContrast
          underline="none"
          href={`/event/${eventSlug}/team/${team.slug}`}
          key={team.id}
        >
          <TeamCard team={team} onDelete={deleteAction} />
        </Link>
      ))}
    </Flex>
  );
}
