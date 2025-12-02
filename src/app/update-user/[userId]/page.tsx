import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Card } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { getUser, updateUser } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';
import UserForm from '@/ui/user-form';

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
        <UserForm onSubmit={onSubmit} editingUser={user} />
      </Card>
    </Flex>
  );
}
