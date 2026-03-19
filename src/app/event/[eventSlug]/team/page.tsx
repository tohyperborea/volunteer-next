import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Heading, Flex, Card, Text, Button, Box, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import TeamCard from '@/ui/team-card';
import { notFound, redirect } from 'next/navigation';
import { deleteTeam, getTeamsForEvent } from '@/service/team-service';
import NextLink from 'next/link';
import { getCreateTeamPath, getTeamInfoPath } from '@/utils/path';

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

  const editorRoles: UserRole[] = [{ type: 'admin' }, { type: 'organiser', eventId: event.id }];

  const teams = await getTeamsForEvent(event.id);
  const isEditable = await checkAuthorisation(editorRoles, true);

  const deleteAction = async (id: TeamId) => {
    'use server';
    await checkAuthorisation(editorRoles);
    await deleteTeam(id);
    redirect(`/event/${eventSlug}/team`);
  };

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('teamsForEvent', { eventName: event.name })}</Heading>
      {isEditable && (
        <Box>
          <NextLink href={getCreateTeamPath(eventSlug)}>
            <Button>
              <PlusIcon /> {t('createTeam')}
            </Button>
          </NextLink>
        </Box>
      )}
      {teams.length === 0 && (
        <Card>
          <Text>{t('noTeams')}</Text>
        </Card>
      )}
      {teams.map((team) => (
        <Link
          highContrast
          asChild
          underline="none"
          href={`/event/${eventSlug}/team/${team.slug}`}
          key={team.id}
        >
          <NextLink href={getTeamInfoPath(eventSlug, team.slug)}>
            <TeamCard
              team={team}
              editable={isEditable}
              eventSlug={eventSlug}
              onDelete={deleteAction}
            />
          </NextLink>
        </Link>
      ))}
    </Flex>
  );
}
