/**
 * UserForm component for creating or editing users.
 * @since 2025-11-14
 * @author Jason Offet
 */

'use client';

import { Flex, Text, TextField, Box, Button } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { User } from '@/types';

const FormItem = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="1">
    {children}
  </Flex>
);

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  editingUser?: User;
}

export default function EventForm({ onSubmit, editingUser }: Props) {
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

        <Box>
          <Button type="submit">{t(editingUser ? 'updateButton' : 'createButton')}</Button>
        </Box>
      </Flex>
    </form>
  );
}
