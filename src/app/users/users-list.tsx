'use client';

import { useState, useMemo } from 'react';
import { Heading, Flex, Card, Text, Button, Box, Link } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import Filters from './filters';

interface UsersListProps {
  users: User[];
  onDeleteUser: (userId: string) => Promise<void>;
  onUndeleteUser: (userId: string) => Promise<void>;
}

interface Filters {
  roleType?: string;
  searchQuery?: string;
  showDeleted?: boolean;
}

export default function UsersList({ users, onDeleteUser, onUndeleteUser }: UsersListProps) {
  const t = useTranslations('UsersDashboard');
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({});

  // Filter users based on applied filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter out deleted users (default: hide deleted users)
      if (user.deletedAt && !(filters.showDeleted === true)) {
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
    router.refresh();
  };

  const handleUndelete = async (userId: string) => {
    await onUndeleteUser(userId);
    router.refresh();
  };

  return (
    <>
      <Filters filters={filters} onFiltersChange={setFilters} />
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
              <Flex direction="column" gap="2" flexGrow="1">
                <Text size="1" color="gray">
                  {t('email')}:
                </Text>
                <Box>{user.email}</Box>
              </Flex>
              {/* Roles */}
              <Flex direction="column" gap="2" flexGrow="1">
                <Text size="1" color="gray">
                  {t('role')}:
                </Text>
                <Box>{user.roles.map((role) => role.type).join(', ') || 'volunteer'}</Box>
              </Flex>
            </Flex>
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
              <Button variant="outline" color="red" onClick={() => handleDelete(user.id)}>
                <TrashIcon />
              </Button>
            )}
          </Flex>
        </Card>
      ))}
    </>
  );
}
