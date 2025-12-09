'use client';

import { useState, useMemo } from 'react';
import { Heading, Flex, Card, Text, Button, Box, Link, Dialog } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import Filters from './user-filters';

interface UsersListProps {
  users: User[];
  onDeleteUser: (userId: string) => Promise<void>;
  onUndeleteUser: (userId: string) => Promise<void>;
  currentUser: User;
}

export default function UsersList({
  users,
  onDeleteUser,
  onUndeleteUser,
  currentUser
}: UsersListProps) {
  const t = useTranslations('UsersList');
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilters>({});
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Filter users based on applied filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter out deleted users (default: hide deleted users)
      if (user.deletedAt && !filters.showDeleted) {
        return false;
      }

      // Filter by role type
      if (filters.roleType) {
        const hasRoleType = user.roles.some((role) => role.type === filters.roleType);
        if (!hasRoleType) {
          return false;
        }
      }

      // Filter by search query (name or email)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  const handleDelete = async (userId: string) => {
    await onDeleteUser(userId);
    setUserToDelete(null);
    router.refresh();
  };

  const handleUndelete = async (userId: string) => {
    await onUndeleteUser(userId);
    router.refresh();
  };

  const hasAccessToShowDeleted = currentUser.roles.some((role) => role.type === 'admin'); // TODO: Add setting to allow event creator to determine access level

  return (
    <>
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        hasAccessToShowDeleted={hasAccessToShowDeleted}
      />
      {filteredUsers.length === 0 && (
        <Card>
          <Text>{t('noUsers')}</Text>
        </Card>
      )}

      {filteredUsers.map((user) => (
        <Card key={user.id}>
          {/* Name */}
          <Heading size="4" mb="2">
            {user.name}
          </Heading>
          <Flex direction="row" gap="2" width="100%">
            <Flex direction={{ initial: 'column', sm: 'row' }} gap="2" width="100%">
              {/* Email */}
              <Flex direction="column" gap="2" width={{ initial: '100%', sm: '40%' }}>
                <Text size="1" color="gray">
                  {t('email')}:
                </Text>
                <Box>{user.email}</Box>
              </Flex>
              {/* Roles */}
              <Flex direction="column" gap="2" width={{ initial: '100%', sm: '40%' }}>
                <Text size="1" color="gray">
                  {t('role')}:
                </Text>
                <Box>{user.roles.map((role) => role.type).join(', ') || 'volunteer'}</Box>
              </Flex>
            </Flex>
            {currentUser.roles.some(
              (role) => role.type === 'admin' || role.type === 'organiser'
            ) && (
              <>
                <Link href={`/update-user/${user.id}`}>
                  <Button variant="outline">
                    <Pencil1Icon />
                  </Button>
                </Link>
                {user.deletedAt ? (
                  <Button variant="outline" color="green" onClick={() => handleUndelete(user.id)}>
                    {t('undelete')}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" color="red" onClick={() => setUserToDelete(user.id)}>
                      <TrashIcon />
                    </Button>
                    <Dialog.Root
                      open={userToDelete === user.id}
                      onOpenChange={(open) => !open && setUserToDelete(null)}
                    >
                      <Dialog.Content>
                        <Dialog.Title>{t('confirmDeletion')}</Dialog.Title>
                        <Dialog.Description>
                          {t('confirmDeleteText', { userName: user.name })}
                        </Dialog.Description>
                        <Flex justify="end" gap="2" mt="4">
                          <Dialog.Close>
                            <Button variant="outline">{t('cancel')}</Button>
                          </Dialog.Close>
                          <Dialog.Close>
                            <Button color="red" onClick={() => handleDelete(user.id)}>
                              {t('delete')}
                            </Button>
                          </Dialog.Close>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                  </>
                )}
              </>
            )}
          </Flex>
        </Card>
      ))}
    </>
  );
}
