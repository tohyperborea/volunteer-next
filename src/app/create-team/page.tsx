import metadata from '@/i18n/metadata';
import { redirect, unauthorized } from 'next/navigation';
import { Flex, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { addRoleToUsers } from '@/service/user-service';
import { checkAuthorisation, getCurrentEventOrRedirect } from '@/session';
import { inTransaction } from '@/db';
import TeamForm from '@/ui/team-form';
import { validateUserIds } from '@/validator/user-validator';
import { validateNewTeam } from '@/validator/team-validator';
import { createTeam } from '@/service/team-service';
import { getTeamsPath } from '@/utils/path';
import { hasEventStarted } from '@/utils/date';

const PAGE_KEY = 'CreateTeamPage';

export const generateMetadata = metadata(PAGE_KEY);

export default async function CreateTeam() {
  const event = await getCurrentEventOrRedirect();

  await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: event.id }]);
  const t = await getTranslations(PAGE_KEY);

  const onSubmit = async (data: FormData) => {
    'use server';

    if (hasEventStarted(event)) {
      unauthorized();
    }

    await checkAuthorisation([{ type: 'admin' }, { type: 'organiser', eventId: event.id }]);

    const newTeam = validateNewTeam(data);
    const teamleads = validateUserIds(data, 'teamleadId');

    await inTransaction(async (client) => {
      const createdTeam = await createTeam(newTeam, client);
      await addRoleToUsers(
        { type: 'team-lead', eventId: event.id, teamId: createdTeam.id },
        teamleads,
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
      <TeamForm eventId={event.id} onSubmit={onSubmit} backOnCancel />
    </Flex>
  );
}
