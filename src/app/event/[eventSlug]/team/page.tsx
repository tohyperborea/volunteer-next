import metadata from '@/i18n/metadata';
import { getEventBySlug } from '@/service/event-service';
import { Heading, Flex, Button, Box, Link, IconButton } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation, currentUser } from '@/session';
import { notFound } from 'next/navigation';
import { getFilteredTeamsForEvent } from '@/service/team-service';
import TeamList from '@/ui/team-list';
import { getCreateTeamPath, getUpdateTeamPath } from '@/utils/path';
import { getShiftsForEvent } from '@/service/shift-service';
import { recordToTeamFilters } from '@/utils/team-filters';
import { getVolunteersForShifts } from '@/service/user-service';
import { getPermissionsProfile } from '@/utils/permissions';
import NextLink from 'next/link';

const PAGE_KEY = 'TeamsDashboardPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventsDashboard({
  params,
  searchParams
}: PageProps<'/event/[eventSlug]/team'>) {
  const t = await getTranslations(PAGE_KEY);

  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  const editorRoles: UserRole[] = [{ type: 'admin' }, { type: 'organiser', eventId: event.id }];

  const filters = recordToTeamFilters(await searchParams);
  const teams = await getFilteredTeamsForEvent(event.id, filters);
  const shifts = await getShiftsForEvent(event.id);
  const shiftVolunteers = await getVolunteersForShifts(
    shifts.map((shift) => shift.id),
    getPermissionsProfile(await currentUser())
  );
  const isEditable = await checkAuthorisation(editorRoles, true);

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
          <Button asChild>
            <NextLink href={getCreateTeamPath(eventSlug)}>
              <PlusIcon /> {t('createTeam')}
            </NextLink>
          </Button>
        </Box>
      )}
      <TeamList
        teams={teams}
        shifts={shifts}
        shiftVolunteers={shiftVolunteers}
        eventSlug={eventSlug}
        itemActions={itemActions}
      />
    </Flex>
  );
}
