import metadata from '@/i18n/metadata';
import { Heading, Flex, Card, Text, Button, Box, Link, Grid } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import { PlusIcon } from '@radix-ui/react-icons';
import { checkAuthorisation } from '@/session';
import { getUsers } from '@/service/user-service';

export const generateMetadata = metadata('UsersDashboard');

export default async function UsersDashboard() {
  await checkAuthorisation([{ type: 'admin' }]);

  const t = await getTranslations('UsersDashboard');
  const users = await getUsers();

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading my="4">{t('title')}</Heading>
      <Box>
        <Link href="/create-user">
          <Button>
            <PlusIcon /> {t('createUser')}
          </Button>
        </Link>
      </Box>
      {users.length === 0 && (
        <Card>
          <Text>{t('noUsers')}</Text>
        </Card>
      )}
      {users.map((user) => (
        <Card key={user.id}>
          <Heading size="4">{user.name}</Heading>
          <Flex direction="row" gap="2" width="100%">
            <Grid columns="3" gap="2" width="100%">
              <Text size="1" color="gray">
                {t('email')}:
              </Text>
              <Text size="1" color="gray">
                {t('emailVerified')}:
              </Text>
              <Text size="1" color="gray">
                {t('roles')}:
              </Text>
              <Box>{user.email}</Box>
              <Box>{user.emailVerified ? t('yes') : t('no')}</Box>
              <Box>{user.roles.map((role) => role.type).join(', ')}</Box>
            </Grid>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
