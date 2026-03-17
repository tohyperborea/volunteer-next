import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Heading, Flex, Button, Box, Link, IconButton } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import { notFound, redirect } from 'next/navigation';
import { deleteTeam, getTeamsForEvent } from '@/service/team-service';
import TeamList from '@/ui/team-list';
import { getUpdateTeamPath } from '@/utils/path';

const PAGE_KEY = 'TeamsDashboardPage';

export const generateMetadata = metadata(PAGE_KEY);

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

  const itemActions = !isEditable
    ? {}
    : teams.reduce<Record<TeamId, React.ReactNode>>((actions, team) => {
        actions[team.id] = (
          <Link href={getUpdateTeamPath(eventSlug, team.id)}>
            <IconButton variant="ghost" aria-label={t('edit', { teamName: team.name })}>
              <Pencil2Icon width={20} height={20} />
            </IconButton>
          </Link>
        );
        return actions;
      }, {});

  return (
    <Flex direction="column" gap="4">
      <Heading my="4" as="h1" align="center">
        {t('title')}
      </Heading>
      {isEditable && (
        <Box>
          <Link href={`/event/${eventSlug}/create-team`}>
            <Button variant="soft">
              <PlusIcon /> {t('createTeam')}
            </Button>
          </Link>
        </Box>
      )}
      <TeamList teams={teams} eventSlug={eventSlug} itemActions={itemActions} />
    </Flex>
  );
}
