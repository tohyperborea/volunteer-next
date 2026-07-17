import metadata from '@/i18n/metadata';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { getUser, updateUser, removeRoleFromUsers, addRoleToUsers } from '@/service/user-service';
import { checkAuthorisation, currentUser, getCurrentEvent } from '@/session';
import { inTransaction } from '@/db';
import UserForm from '@/ui/user-form';
import { getEvents } from '@/service/event-service';
import { getAllTeams } from '@/service/team-service';
import { validateExistingUser } from '@/validator/user-validator';
import { getEditUserPath, getUsersDashboardPath } from '@/utils/path';
import { getPermissionsProfile } from '@/utils/permissions';
import { revalidatePath } from 'next/cache';

const PAGE_KEY = 'EditUserPage';
export const generateMetadata = metadata(PAGE_KEY);

interface SearchParams {
  callbackUrl?: string;
}

export default async function EditUser({
  params,
  searchParams
}: PagePropsWithSearch<'/update-user/[userId]', SearchParams>) {
  const userId = (await params).userId;
  if (!userId) {
    notFound();
  }

  const isAdmin = await checkAuthorisation([{ type: 'admin' }], true);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  if (!isAdmin && permissionsProfile.userId !== userId) {
    unauthorized();
  }

  const event = await getCurrentEvent();
  const user = await getUser(userId, event?.id);
  if (!user) {
    throw new Error('User not found');
  }

  const { callbackUrl = getUsersDashboardPath() } = await searchParams;
  const events = await getEvents();
  const teams = await getAllTeams();
  const t = await getTranslations(PAGE_KEY);

  const onSubmit = async (data: FormData) => {
    'use server';

    const isAdmin = await checkAuthorisation([{ type: 'admin' }], true);
    const permissionsProfile = getPermissionsProfile(await currentUser());
    if (!isAdmin && permissionsProfile.userId !== userId) {
      unauthorized();
    }

    const validatedUser = validateExistingUser(data);

    const existingUser = await getUser(validatedUser.id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (!isAdmin && existingUser.email !== validatedUser.email) {
      unauthorized();
    }

    await updateUser(validatedUser.id, validatedUser);
    redirect(callbackUrl);
  };

  const onDeleteRole = async (role: UserRole, roleUserId: string) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    // Prevent users from removing their own admin role
    const current = await currentUser();
    if (role.type === 'admin' && roleUserId === current?.id) {
      throw new Error('You cannot remove your own admin role.');
    }

    await removeRoleFromUsers(role as UserRole, [roleUserId]);
    revalidatePath(getEditUserPath(roleUserId));
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
        await addRoleToUsers({ type: 'admin' }, [roleUserId], client);
      } else if (roleType === 'organiser') {
        const eventId = data.get('newRoleEventId')?.toString();
        if (!eventId) {
          throw new Error('Event ID is required for organiser role');
        }
        await addRoleToUsers({ type: 'organiser', eventId }, [roleUserId], client);
      } else if (roleType === 'team-lead') {
        const eventId = data.get('newRoleEventId')?.toString();
        const teamId = data.get('newRoleTeamId')?.toString();
        if (!eventId) {
          throw new Error('Event ID is required for team-lead role');
        }
        if (!teamId) {
          throw new Error('Team ID is required for team-lead role');
        }
        await addRoleToUsers({ type: 'team-lead', eventId, teamId }, [roleUserId], client);
      }
    });

    revalidatePath(getEditUserPath(roleUserId));
  };

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <UserForm
          onSubmit={onSubmit}
          onDeleteRole={onDeleteRole}
          onAddRole={onAddRole}
          editingUser={user}
          events={events}
          teams={teams}
          permissionsProfile={permissionsProfile}
          callbackUrl={callbackUrl}
        />
      </Card>
    </Flex>
  );
}
