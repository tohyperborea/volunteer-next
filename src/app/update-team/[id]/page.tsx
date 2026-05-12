import metadata from '@/i18n/metadata';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { addRoleToUsers, getUsersWithRole, removeRoleFromUsers } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import { inTransaction } from '@/db';
import TeamForm from '@/ui/team-form';
import { validateExistingTeam } from '@/validator/team-validator';
import { validateUserIds } from '@/validator/user-validator';
import { deleteTeam, getTeamById, updateTeam } from '@/service/team-service';
import { usersToVolunteers } from '@/lib/volunteer';
import { getPermissionsProfile } from '@/utils/permissions';
import { getCallbackUrl, getTeamsPath } from '@/utils/path';
import { hasEventStarted } from '@/utils/date';

const PAGE_KEY = 'UpdateTeamPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function UpdateTeam({ params, searchParams }: PageProps<'/update-team/[id]'>) {
  const { id } = await params;
  const redirectTo = getCallbackUrl(await searchParams) || getTeamsPath();
  const event = await getCurrentEventOrRedirect();
  const team = id ? await getTeamById(id) : null;
  if (!team || team.eventId !== event.id) {
    notFound();
  }
  if (hasEventStarted(event)) {
    unauthorized();
  }
  const authorisedRoles: UserRole[] = [
    { type: 'admin' },
    { type: 'organiser', eventId: team.eventId },
    { type: 'team-lead', eventId: team.eventId, teamId: team.id }
  ];
  await checkAuthorisation(authorisedRoles);
  const canDelete = await checkAuthorisation(
    [{ type: 'admin' }, { type: 'organiser', eventId: team.eventId }],
    true
  );
  const t = await getTranslations(PAGE_KEY);

  const onSubmit = async (data: FormData) => {
    'use server';

    const newTeam = validateExistingTeam(data);
    if (newTeam.id !== team.id || newTeam.eventId !== team.eventId) {
      notFound();
    }

    await checkAuthorisation(authorisedRoles);

    const roleToAdd: UserRole = { type: 'team-lead', eventId: newTeam.eventId, teamId: newTeam.id };
    const newTeamleads = new Set(validateUserIds(data, 'teamleadId'));
    const existingTeamleads = new Set((await getUsersWithRole(roleToAdd)).map(({ id }) => id));
    const toRemove = existingTeamleads.difference(newTeamleads);
    const toAdd = newTeamleads.difference(existingTeamleads);
    await inTransaction(async (client) => {
      await updateTeam(newTeam, client);
      if (toRemove.size > 0) {
        await removeRoleFromUsers(roleToAdd, Array.from(toRemove), client);
      }
      if (toAdd.size > 0) {
        await addRoleToUsers(roleToAdd, Array.from(toAdd), client);
      }
    });
    redirect(redirectTo);
  };

  const onDelete = async () => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: team.eventId }]);
    await deleteTeam(team.id);
    redirect(getTeamsPath());
  };

  const permissionsProfile = getPermissionsProfile(await currentUser());
  const teamleadRole: UserRole = { type: 'team-lead', eventId: team.eventId, teamId: team.id };
  const teamLeadUsers = await getUsersWithRole(teamleadRole);
  const teamleads = usersToVolunteers(teamLeadUsers, permissionsProfile);

  return (
    <Flex direction="column" gap="4">
      <Heading my="4" as="h1" align="center">
        {t('title')}
      </Heading>
      <TeamForm
        eventId={team.eventId}
        onSubmit={onSubmit}
        onDelete={canDelete ? onDelete : undefined}
        backOnCancel
        editingTeam={team}
        editingTeamleads={teamleads}
      />
    </Flex>
  );
}
