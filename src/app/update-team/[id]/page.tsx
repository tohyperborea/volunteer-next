import metadata from '@/i18n/metadata';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import {
  addRoleToUser,
  getUsers,
  getUsersWithRole,
  removeRoleFromUsers
} from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import { inTransaction } from '@/db';
import TeamForm from '@/ui/team-form';
import { validateExistingTeam } from '@/validator/team-validator';
import { validateUserId } from '@/validator/user-validator';
import { deleteTeam, getTeamById, updateTeam } from '@/service/team-service';
import { usersToVolunteers, userToVolunteer } from '@/lib/volunteer';
import { getPermissionsProfile } from '@/utils/permissions';
import { getTeamsPath } from '@/utils/path';
import { hasEventStarted } from '@/utils/date';

const PAGE_KEY = 'UpdateTeamPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function UpdateTeam({ params }: PageProps<'/update-team/[id]'>) {
  const { id } = await params;
  const event = await getCurrentEventOrRedirect();
  const team = id ? await getTeamById(id) : null;
  if (!team || team.eventId !== event.id) {
    notFound();
  }
  if (hasEventStarted(event)) {
    unauthorized();
  }
  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: team.eventId }]);
  const t = await getTranslations(PAGE_KEY);

  const onSubmit = async (data: FormData) => {
    'use server';

    const newTeam = validateExistingTeam(data);

    await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: newTeam.eventId }]);

    const teamlead = validateUserId(data, 'teamleadId');

    const roleToAdd: UserRole = { type: 'team-lead', eventId: newTeam.eventId, teamId: newTeam.id };
    const existingTeamleads = await getUsersWithRole(roleToAdd);
    // Only currently supporting a single teamlead, so remove all who aren't the new one
    // If we are removing all existing teamleads, it means we need to add the new one
    const toRemove = existingTeamleads
      .map((user) => user.id)
      .filter((userId) => userId !== teamlead);
    const shouldAdd = toRemove.length === existingTeamleads.length;

    await inTransaction(async (client) => {
      await updateTeam(newTeam, client);
      if (toRemove.length > 0) {
        await removeRoleFromUsers(roleToAdd, toRemove, client);
      }
      if (shouldAdd) {
        await addRoleToUser(roleToAdd, teamlead, client);
      }
    });
    redirect(getTeamsPath());
  };

  const onDelete = async () => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: team.eventId }]);
    await deleteTeam(team.id);
    redirect(getTeamsPath());
  };

  const permissionsProfile = getPermissionsProfile(await currentUser());
  const volunteers = usersToVolunteers(await getUsers(), permissionsProfile);
  const teamleadRole: UserRole = { type: 'team-lead', eventId: team.eventId, teamId: team.id };
  const teamLeadUser = (await getUsersWithRole(teamleadRole))[0];
  const teamlead = teamLeadUser ? userToVolunteer(teamLeadUser, permissionsProfile) : undefined;

  return (
    <Flex direction="column" gap="4">
      <Heading my="4" as="h1" align="center">
        {t('title')}
      </Heading>
      <TeamForm
        eventId={team.eventId}
        onSubmit={onSubmit}
        onDelete={onDelete}
        backOnCancel
        teamleadOptions={volunteers}
        editingTeam={team}
        editingTeamlead={teamlead}
      />
    </Flex>
  );
}
