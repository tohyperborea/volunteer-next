import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createUser, addRoleToUsers } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import { inTransaction } from '@/db';
import UserForm from '@/ui/user-form';
import { getEvents } from '@/service/event-service';
import { getAllTeams } from '@/service/team-service';
import { validateNewUser } from '@/validator/user-validator';
import { getUsersDashboardPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';

const PAGE_KEY = 'CreateUserPage';
export const generateMetadata = metadata(PAGE_KEY);

export default async function CreateUser() {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const t = await getTranslations(PAGE_KEY);

    const validatedUser = validateNewUser(data);
    const role = data.get('role')?.toString() ?? null;

    await inTransaction(async (client) => {
      const newUser = await createUser(validatedUser, client);

      if (role === 'admin') {
        await addRoleToUsers({ type: 'admin' }, [newUser.id], client);
      } else if (role === 'organiser') {
        const eventId = data.get('eventId')?.toString() ?? null;
        if (!eventId) {
          throw new Error(t('errors.eventIdRequiredForOrganiser'));
        }
        await addRoleToUsers({ type: 'organiser', eventId }, [newUser.id], client);
      } else if (role === 'team-lead') {
        const eventId = data.get('eventId')?.toString() ?? null;
        const teamId = data.get('teamId')?.toString() ?? null;
        if (!eventId) {
          throw new Error(t('errors.eventIdRequiredForTeamLead'));
        }
        if (!teamId) {
          throw new Error(t('errors.teamIdRequiredForTeamLead'));
        }
        await addRoleToUsers({ type: 'team-lead', eventId, teamId }, [newUser.id], client);
      }
    });
    redirect(getUsersDashboardPath());
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const t = await getTranslations(PAGE_KEY);
  const events = await getEvents();
  const teams = await getAllTeams();

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <UserForm
          onSubmit={onSubmit}
          events={events}
          teams={teams}
          permissionsProfile={permissionsProfile}
        />
      </Card>
    </Flex>
  );
}
