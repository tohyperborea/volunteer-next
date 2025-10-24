/**
 * Base homepage
 * @since 2025-09-02
 * @author Michael Townsend <@continuities>
 */

import { Flex, Text } from '@radix-ui/themes';
import db from '@/db';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyApp() {
  const authData = await auth.api.signInWithOAuth2({
    body: {
      providerId: 'local-pretix',
      callbackURL: '/',
      scopes: ['openid']
    }
  });
  console.log('Auth Data:', authData);

  if (authData.redirect) {
    redirect(authData.url);
    return;
  }

  const session = await auth.api.getSession({
    headers: await headers()
  });
  console.log('Session Data:', session);

  const dbValue = (await db.query('SELECT 1 as value')).rows[0].value; // Ensure DB is initialized
  return (
    <Flex direction="column" gap="2">
      <Text>Hello World [{dbValue}]</Text>
    </Flex>
  );
}
