import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { getUser, updateUser, removeRoleFromUsers, addRoleToUser } from '@/service/user-service';
import { checkAuthorisation, currentUser } from '@/session';
import { inTransaction } from '@/db';
import UserForm from '@/ui/user-form';
import { getEvents } from '@/service/event-service';
import { getTeams } from '@/service/team-service';

export const generateMetadata = metadata('EditUser');

export default async function EditUser({ params }: { params: Promise<{ userId: string }> }) {
  const userId = (await params).userId;
  if (!userId) {
    throw new Error('User ID is required');
  }

  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const formUserId = data.get('id')?.toString();
    if (!formUserId) {
      throw new Error('User ID is required');
    }

    const name = data.get('name')?.toString() ?? null;
    if (!name) {
      throw new Error('User name is required');
    }
    const email = data.get('email')?.toString() ?? null;
    if (!email) {
      throw new Error('User email is required');
    }

    const existingUser = await getUser(formUserId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await inTransaction(async (client) => {
      await updateUser(
        formUserId,
        {
          id: formUserId,
          name,
          email,
          roles: existingUser.roles
        },
        client
      );
    });
    redirect('/users');
  };

  const onDeleteRole = async (
    role: { type: string; eventId?: string; teamId?: string },
    roleUserId: string
  ) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    await removeRoleFromUsers(role as any, [roleUserId]);
    redirect(`/update-user/${roleUserId}`);
  };

  const onAddRole = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const roleUserId = data.get('userId')?.toString();
    if (!roleUserId) {
      throw new Error('User ID is required');
    }

    const roleType = data.get('newRoleType')?.toString();
    if (!roleType) {
      throw new Error('Role type is required');
    }

    await inTransaction(async (client) => {
      if (roleType === 'admin') {
        await addRoleToUser({ type: 'admin' }, roleUserId, client);
      } else if (roleType === 'organiser') {
        const eventId = data.get('newRoleEventId')?.toString();
        if (!eventId) {
          throw new Error('Event ID is required for organiser role');
        }
        await addRoleToUser({ type: 'organiser', eventId }, roleUserId, client);
      } else if (roleType === 'team-lead') {
        const eventId = data.get('newRoleEventId')?.toString();
        const teamId = data.get('newRoleTeamId')?.toString();
        if (!eventId) {
          throw new Error('Event ID is required for team-lead role');
        }
        if (!teamId) {
          throw new Error('Team ID is required for team-lead role');
        }
        await addRoleToUser({ type: 'team-lead', eventId, teamId }, roleUserId, client);
      }
    });

    redirect(`/update-user/${roleUserId}`);
  };
  if (!userId) {
    throw new Error('User ID is required');
  }
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const events = await getEvents();
  const teams = await getTeams();

  await checkAuthorisation([{ type: 'admin' }]);
  const current = await currentUser();
  const t = await getTranslations('EditUser');

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <UserForm
          onSubmit={onSubmit}
          onDeleteRole={onDeleteRole}
          onAddRole={onAddRole}
          editingUser={user}
          events={events}
          teams={teams}
          currentUserId={current?.id}
        />
      </Card>
    </Flex>
  );
}
