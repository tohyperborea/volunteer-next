import metadata from '@/i18n/metadata';
import { notFound, redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import {
  addRoleToUser,
  getUsers,
  getUsersWithRole,
  removeRoleFromUsers
} from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import TeamForm from '@/ui/team-form';
import { validateExistingTeam } from '@/validator/team-validator';
import { validateUserId } from '@/validator/user-validator';
import { getTeamById, updateTeam } from '@/service/team-service';

const PAGE_KEY = 'UpdateTeamPage';

export const generateMetadata = metadata(PAGE_KEY);

interface Props {
  params: Promise<{ id: string; eventSlug: UrlSlug }>;
}

export default async function UpdateTeam({ params }: Props) {
  const { id, eventSlug } = await params;
  const team = id ? await getTeamById(id) : null;
  if (!team) {
    notFound();
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
    redirect(`/event/${eventSlug}/team`);
  };

  try {
    const users = await getUsers();
    const teamleadRole: UserRole = { type: 'team-lead', eventId: team.eventId, teamId: team.id };
    const teamlead = (await getUsersWithRole(teamleadRole))[0];

    return (
      <Flex direction="column" gap="4" p="4">
        <Heading my="4">{t('title')}</Heading>
        <Card>
          <TeamForm
            eventId={team.eventId}
            onSubmit={onSubmit}
            backOnCancel
            teamleadOptions={users}
            editingTeam={team}
            editingTeamlead={teamlead}
          />
        </Card>
      </Flex>
    );
  } catch (error) {
    console.error(error);
    throw new Error('Invalid input');
  }
}
