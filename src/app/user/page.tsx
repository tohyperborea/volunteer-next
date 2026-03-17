import metadata from '@/i18n/metadata';
import { Heading, Flex, Button, Dialog, Link } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { checkAuthorisation, currentUser } from '@/session';
import { getFilteredUsers, getUsers } from '@/service/user-service';
import { markUserAsDeleted, undeleteUser } from '@/service/user-service';
import { revalidatePath } from 'next/cache';
import { getCreateUserPath, getEditUserPath, getUsersDashboardPath } from '@/utils/path';
import VolunteerList from '@/ui/volunteer-list';
import { usersToVolunteers } from '@/lib/volunteer';
import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import DeleteButton from '@/ui/delete-button';
import { recordToUserFilters } from '@/utils/user-filters';
import { getPermissionsProfile } from '@/utils/permissions';

const PAGE_KEY = 'UsersDashboardPage';
export const generateMetadata = metadata(PAGE_KEY);

export default async function UsersDashboardPage({ searchParams }: PageProps<'/user'>) {
  const editors: UserRole[] = [{ type: 'admin' }];
  const canEdit = await checkAuthorisation(editors, true);
  const permissionsProfile = getPermissionsProfile(await currentUser());
  const t = await getTranslations(PAGE_KEY);
  const filters = recordToUserFilters(await searchParams);
  const users = await getFilteredUsers(filters, permissionsProfile);
  const volunteers = usersToVolunteers(users, permissionsProfile);
  const withFilters: (keyof UserFilters)[] = ['searchQuery', 'roleType'];
  if (canEdit) {
    withFilters.push('showDeleted');
  }

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

  const itemActions: Record<UserId, React.ReactNode> = {};
  if (canEdit) {
    for (const user of users) {
      itemActions[user.id] = (
        <Flex gap="2">
          <Link href={getEditUserPath(user.id)}>
            <Button variant="outline">
              <Pencil1Icon />
            </Button>
          </Link>
          {user.deletedAt ? (
            <Button
              variant="outline"
              color="green"
              onClick={handleUndeleteUser.bind(null, user.id)}
            >
              {t('undelete')}
            </Button>
          ) : (
            <DeleteButton
              title={t('confirmDeletion')}
              description={t('confirmDeleteText', { userName: user.name })}
              onDelete={handleDeleteUser.bind(null, user.id)}
            />
          )}
        </Flex>
      );
    }
  }

  return (
    <Flex direction="column" gap="4">
      <Heading my="4" as="h1" align="center">
        {t('title')}
      </Heading>
      {canEdit && (
        <Link href={getCreateUserPath()}>
          <Button variant="soft" color="blue">
            <PlusIcon /> {t('createUser')}
          </Button>
        </Link>
      )}
      <VolunteerList volunteers={volunteers} withFilters={withFilters} itemActions={itemActions} />
    </Flex>
  );
}
