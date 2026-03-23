/**
 * UserForm component for creating or editing users.
 * @since 2025-11-14
 * @author Jason Offet <@joffet>
 */

'use client';

import { Flex, Text, TextField, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import RolesEditForm from './roles-edit-form';
import NewRoleForm from './new-role-form';

import NextLink from 'next/link';
import { getUsersDashboardPath } from '@/utils/path';

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="1">
    {children}
  </Flex>
);

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  onDeleteRole?: (role: UserRole, userId: string) => Promise<void>;
  onAddRole?: (data: FormData) => Promise<void>;
  callbackUrl?: string;
  editingUser?: User;
  events: EventInfo[];
  teams: TeamInfo[];
  permissionsProfile: PermissionsProfile;
}

export default function UserForm({
  onSubmit,
  onDeleteRole,
  onAddRole,
  callbackUrl = getUsersDashboardPath(),
  editingUser,
  events,
  teams,
  permissionsProfile
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
          <Text
            as="label"
            id="user-displayname-label"
            htmlFor="user-displayname"
            size="2"
            weight="bold"
          >
            {t('displayName')}
          </Text>
          <TextField.Root
            name="chosenName"
            aria-labelledby="user-displayname-label"
            id="user-displayname"
            placeholder={t('displayName')}
            autoComplete="off"
            defaultValue={editingUser?.chosenName}
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
            readOnly={editingUser && !permissionsProfile.admin}
            required
          />
        </FormItem>
        <Flex direction="row" justify="between">
          <Button variant="outline" asChild>
            <NextLink href={callbackUrl}>{t('cancelButton')}</NextLink>
          </Button>
          <Button type="submit">{t(editingUser ? 'updateButton' : 'createButton')}</Button>
        </Flex>
        {/* Roles */}
        {permissionsProfile.admin &&
          (editingUser ? (
            <RolesEditForm
              onDeleteRole={onDeleteRole}
              onAddRole={onAddRole}
              editingUser={editingUser}
              events={events}
              teams={teams}
              permissionsProfile={permissionsProfile}
            />
          ) : (
            <NewRoleForm events={events} teams={teams} />
          ))}
      </Flex>
    </form>
  );
}
