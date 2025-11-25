import metadata from '@/i18n/metadata';
import { redirect } from 'next/navigation';
import { Flex, Heading, Box, Button, Card, TextField } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { createUser } from '@/service/user-service';
import { checkAuthorisation } from '@/session';
import { inTransaction } from '@/db';

export const generateMetadata = metadata('CreateUser');

export default async function CreateUser() {
  const onSubmit = async (data: FormData) => {
    'use server';

    await checkAuthorisation([{ type: 'admin' }]);

    const name = data.get('name')?.toString() ?? null;
    if (!name) {
      throw new Error('User name is required');
    }
    const email = data.get('email')?.toString() ?? null;
    if (!email) {
      throw new Error('User email is required');
    }
    inTransaction(async (client) => {
      await createUser({ name, email }, client);
    });
    redirect('/users');
  };

  await checkAuthorisation([{ type: 'admin' }]);
  const t = await getTranslations('CreateUser');

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Card>
        <form action={onSubmit}>
          <Flex direction="column" gap="2">
            <TextField.Root name="name" placeholder={t('userName')} required />
            <TextField.Root name="email" type="email" placeholder={t('userEmail')} required />
            <Box>
              <Button type="submit">{t('createButton')}</Button>
            </Box>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
