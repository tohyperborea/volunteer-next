import metadata from '@/i18n/metadata';
import { Heading, Flex } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { checkAuthorisation, currentUser } from '@/session';
import { getUsers } from '@/service/user-service';
import { markUserAsDeleted, undeleteUser } from '@/service/user-service';
import { revalidatePath } from 'next/cache';
import UsersList from '@/ui/users-list';
import { getUsersDashboardPath } from '@/utils/path';

const PAGE_KEY = 'UsersDashboardPage';
export const generateMetadata = metadata(PAGE_KEY);

export default async function UsersDashboardPage() {
  const editors: UserRole[] = [{ type: 'admin' }];
  const canEdit = await checkAuthorisation(editors, true);

  const t = await getTranslations(PAGE_KEY);
  const users = await getUsers();
  // checkAuthorisation will throw if not logged in, so we can be sure user is defined here
  const user = (await currentUser())!;

  const handleDeleteUser = async (userId: string) => {
    'use server';
    await checkAuthorisation(editors);
    await markUserAsDeleted(userId);
    revalidatePath(getUsersDashboardPath());
  };

  const handleUndeleteUser = async (userId: string) => {
    'use server';
    await checkAuthorisation(editors);
    await undeleteUser(userId);
    revalidatePath(getUsersDashboardPath());
  };

  return (
    <Flex direction="column" gap="4">
      <Heading my="4">{t('title')}</Heading>
      <UsersList
        users={users}
        onDeleteUser={canEdit ? handleDeleteUser : undefined}
        onUndeleteUser={canEdit ? handleUndeleteUser : undefined}
        currentUser={user}
      />
    </Flex>
  );
}
