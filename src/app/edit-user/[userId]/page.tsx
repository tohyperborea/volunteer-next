import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Box, Button, Card, TextField, Select } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { getUser, updateUser } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';

export const generateMetadata = metadata('EditUser');

export default async function EditUser({ params }: { params: Promise<{ userId: string }> }) {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const userId = data.get('userId')?.toString();
    if (!userId) {
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

    const existingUser = await getUser(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await inTransaction(async (client) => {
      await updateUser(
        userId,
        {
          id: userId,
          name,
          email,
          roles: existingUser.roles
        },
        client
      );
    });
    redirect('/users');
  };
  const userId = (await params).userId;
  if (!userId) {
    throw new Error('User ID is required');
  }
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }
  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations('EditUser');

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <form action={onSubmit}>
          <Flex direction="column" gap="2">
            <input type="hidden" name="userId" value={user.id} />
            <TextField.Root
              name="name"
              placeholder={t('userName')}
              required
              defaultValue={user.name}
            />
            <TextField.Root
              name="email"
              type="email"
              placeholder={t('userEmail')}
              required
              defaultValue={user.email}
            />
            <Select.Root
              required
              name="roles"
              defaultValue={user.roles.map((role) => role.type).join(', ') || 'volunteer'}
            >
              <Select.Trigger placeholder={t('role')} />
              <Select.Content>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="organiser">Organiser</Select.Item>
              </Select.Content>
            </Select.Root>

            <Box>
              <Button type="submit">{t('saveButton')}</Button>
            </Box>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
