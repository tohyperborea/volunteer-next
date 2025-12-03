import metadata from '@/i18n/metadata';
import { Heading, Flex } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { checkAuthorisation, currentUser } from '@/session';
import { getUsers } from '@/service/user-service';
import { markUserAsDeleted, undeleteUser } from '@/service/user-service';
import { revalidatePath } from 'next/cache';
import UsersList from './users-list';

export const generateMetadata = metadata('UsersDashboard');

export default async function UsersDashboard() {
  await checkAuthorisation([{ type: 'admin' }]);

  const t = await getTranslations('UsersDashboard');
  const users = await getUsers();
  const user = await currentUser();

  const handleDeleteUser = async (userId: string) => {
    'use server';
    await markUserAsDeleted(userId);
    revalidatePath('/users');
  };

  const handleUndeleteUser = async (userId: string) => {
    'use server';
    await undeleteUser(userId);
    revalidatePath('/users');
  };

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <UsersList
        users={users}
        onDeleteUser={handleDeleteUser}
        onUndeleteUser={handleUndeleteUser}
        currentUser={user as User}
      />
    </Flex>
  );
}
