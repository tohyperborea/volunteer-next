import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createUser, addRoleToUser } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import UserForm from '@/ui/user-form';

export const generateMetadata = metadata('CreateUser');

export default async function CreateUser() {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const name = data.get('name')?.toString() ?? null;
    if (!name) {
      throw new Error('User name is required');
    }
    const email = data.get('email')?.toString() ?? null;
    if (!email) {
      throw new Error('User email is required');
    }
    const role = data.get('role')?.toString() ?? null;
    if (!role) {
      throw new Error('User role is required');
    }

    await inTransaction(async (client) => {
      const newUser = await createUser({ name, email }, client);

      if (role === 'admin') {
        await addRoleToUser({ type: 'admin' }, newUser.id, client);
      } else if (role === 'organiser') {
        const eventId = data.get('eventId')?.toString() ?? null;
        if (!eventId) {
          throw new Error('Event ID is required for organiser role');
        }
        await addRoleToUser({ type: 'organiser', eventId }, newUser.id, client);
      } else if (role === 'team-lead') {
        const eventId = data.get('eventId')?.toString() ?? null;
        const teamId = data.get('teamId')?.toString() ?? null;
        if (!eventId) {
          throw new Error('Event ID is required for team-lead role');
        }
        if (!teamId) {
          throw new Error('Team ID is required for team-lead role');
        }
        await addRoleToUser({ type: 'team-lead', eventId, teamId }, newUser.id, client);
      }
    });
    redirect('/users');
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations('CreateUser');

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <UserForm onSubmit={onSubmit} editingUser={undefined} />
      </Card>
    </Flex>
  );
}
