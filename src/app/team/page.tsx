import metadata from '@/i18n/metadata';
import { Heading, Flex, Button, Text, IconButton } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import {
  checkAuthorisation,
  currentUser,
  getCurrentEventOrRedirect,
  getMatchingRoles
} from '@/session';
import { getFilteredTeamsForEvent, getTeamsById, getTeamsForEvent } from '@/service/team-service';
import TeamList from '@/ui/team-list';
import { getCreateTeamPath, getTeamShiftsPath, getUpdateTeamPath } from '@/utils/path';
import { getShiftsForEvent } from '@/service/shift-service';
import { recordToTeamFilters } from '@/utils/team-filters';
import { getVolunteersForShifts } from '@/service/user-service';
import { getPermissionsProfile } from '@/utils/permissions';
import NextLink from 'next/link';
import { hasEventEnded, hasEventStarted } from '@/utils/date';
import { getQualificationsForEvent } from '@/service/qualification-service';
import AddShiftButton from '@/ui/add-shift-button';
import { redirect } from 'next/navigation';
import { getSaveShiftAction } from '@/lib/shifts';

const PAGE_KEY = 'TeamsDashboardPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function EventsDashboard({ searchParams }: PageProps<'/team'>) {
  const t = await getTranslations(PAGE_KEY);

  const event = await getCurrentEventOrRedirect();

  const editorRoles: UserRole[] = [{ type: 'admin' }, { type: 'organiser', eventId: event.id }];

  const filters = recordToTeamFilters(await searchParams);
  const teams = await getFilteredTeamsForEvent(event.id, filters);
  const shifts = await getShiftsForEvent(event.id);
  const shiftVolunteers = await getVolunteersForShifts(
    shifts.map((shift) => shift.id),
    getPermissionsProfile(await currentUser()),
    event.id
  );
  const hasEventAccess = await checkAuthorisation(editorRoles, true);
  const leadTeamsIds = (await getMatchingRoles({ type: 'team-lead', eventId: event.id })).map(
    (role) => (role as TeamLeadRole).teamId
  );
  const isEditable = !hasEventStarted(event) && (hasEventAccess || leadTeamsIds.length > 0);
  const qualifications = isEditable ? await getQualificationsForEvent(event.id) : [];
  const managedTeams = hasEventAccess
    ? await getTeamsForEvent(event.id)
    : await getTeamsById(leadTeamsIds);

  const itemActions = !isEditable
    ? {}
    : managedTeams.reduce<Record<TeamId, React.ReactNode>>((actions, team) => {
        actions[team.id] = (
          <NextLink href={getUpdateTeamPath(team.id)}>
            <IconButton variant="ghost" aria-label={t('edit', { teamName: team.name })}>
              <Pencil2Icon width={20} height={20} />
            </IconButton>
          </NextLink>
        );
        return actions;
      }, {});

  const onSaveShift = getSaveShiftAction({
    isEditable,
    event,
    redirectUri: async (shift) => {
      'use server';
      return getTeamShiftsPath(managedTeams.find((t) => t.id === shift.teamId)!.slug);
    }
  });

  return (
    <Flex direction="column" gap="4">
      <Heading as="h1" align="center" mt="4">
        {event.name}
      </Heading>
      <Flex direction="column" mb="4">
        <Heading as="h2">{t('title')}</Heading>
        <Text>{t(isEditable ? 'descriptionAdmin' : 'description')}</Text>
      </Flex>
      {isEditable && (
        <Flex gap="2">
          {hasEventAccess && (
            <Button asChild variant="soft">
              <NextLink href={getCreateTeamPath()}>
                <PlusIcon /> {t('createTeam')}
              </NextLink>
            </Button>
          )}
          <AddShiftButton
            event={event}
            teams={managedTeams}
            qualifications={qualifications}
            onSaveShift={onSaveShift}
          />
        </Flex>
      )}
      <TeamList
        teams={teams}
        shifts={shifts}
        shiftVolunteers={shiftVolunteers}
        itemActions={itemActions}
        showSignup={!hasEventEnded(event)}
      />
    </Flex>
  );
}
