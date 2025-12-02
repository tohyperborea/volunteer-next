/**
 * UserForm component for creating or editing users.
 * @since 2025-11-14
 * @author Jason Offet <@joffet>
 */

'use client';

import { Flex, Text, TextField, Box, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import RolesTable from './roles-table';
import NewRoleRow from './new-roles-table';

import Link from 'next/link';

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="1">
    {children}
  </Flex>
);

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  onDeleteRole?: (role: UserRole, userId: string) => Promise<void>;
  onAddRole?: (data: FormData) => Promise<void>;
  editingUser?: User;
  events: EventInfo[];
  teams: TeamInfo[];
  currentUserId?: string;
}

export default function UserForm({
  onSubmit,
  onDeleteRole,
  onAddRole,
  editingUser,
  events,
  teams,
  currentUserId
}: Props) {
  const t = useTranslations('UserForm');

  return (
    <form action={onSubmit}>
      {editingUser && <input type="hidden" name="id" value={editingUser.id} />}
      <Flex direction="column" gap="4">
        <FormItem>
          <Text as="label" id="user-name-label" htmlFor="user-name" size="2" weight="bold">
            {t('userName')}
          </Text>
          <TextField.Root
            name="name"
            aria-labelledby="user-name-label"
            id="user-name"
            placeholder={t('userName')}
            autoComplete="off"
            defaultValue={editingUser?.name}
            required
          />
        </FormItem>
        <FormItem>
          <Text as="label" id="user-email-label" htmlFor="user-email" size="2" weight="bold">
            {t('userEmail')}
          </Text>
          <TextField.Root
            name="email"
            id="user-email"
            aria-labelledby="user-email-label"
            type="email"
            placeholder={t('userEmail')}
            defaultValue={editingUser?.email}
            required
          />
        </FormItem>
        <Flex direction="row" justify="between">
          <Link href="/users">
            <Button variant="outline">{t('cancelButton')}</Button>
          </Link>
          <Button type="submit">{t(editingUser ? 'updateButton' : 'createButton')}</Button>
        </Flex>
        {/* Roles */}
        {editingUser ? (
          <RolesTable
            onDeleteRole={onDeleteRole}
            onAddRole={onAddRole}
            editingUser={editingUser}
            events={events}
            teams={teams}
            currentUserId={currentUserId}
          />
        ) : (
          <NewRoleRow events={events} teams={teams} />
        )}
      </Flex>
    </form>
  );
}
