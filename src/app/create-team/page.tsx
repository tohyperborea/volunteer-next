import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { addRoleToUser, getUsers } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEventOrRedirect } from '@/session';
import { inTransaction } from '@/db';
import TeamForm from '@/ui/team-form';
import { validateUserId } from '@/validator/user-validator';
import { validateNewTeam } from '@/validator/team-validator';
import { createTeam } from '@/service/team-service';
import { usersToVolunteers } from '@/lib/volunteer';
import { getPermissionsProfile } from '@/utils/permissions';
import { getTeamsPath } from '@/utils/path';

const PAGE_KEY = 'CreateTeamPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function CreateTeam() {
  const event = await getCurrentEventOrRedirect();

  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: event.id }]);
  const t = await getTranslations(PAGE_KEY);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const volunteers = usersToVolunteers(await getUsers(), permissionsProfile);

  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: event.id }]);

    const newTeam = validateNewTeam(data);
    const teamlead = validateUserId(data, 'teamleadId');

    await inTransaction(async (client) => {
      const createdTeam = await createTeam(newTeam, client);
      await addRoleToUser(
        { type: 'team-lead', eventId: event.id, teamId: createdTeam.id },
        teamlead,
        client
      );
    });
    redirect(getTeamsPath());
  };

  return (
    <Flex direction="column" gap="4">
      <Heading my="4" as="h1" align="center">
        {t('title')}
      </Heading>
      <TeamForm eventId={event.id} onSubmit={onSubmit} backOnCancel teamleadOptions={volunteers} />
    </Flex>
  );
}
