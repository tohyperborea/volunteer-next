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
  const signin = async () => {
    'use server';
    const data = await auth.api.signInWithOAuth2({
      body: {
        providerId: process.env.OAUTH_PROVIDER_ID,
        callbackURL: '/',
        scopes: ['openid', 'email', 'profile']
      }
    });
    if (data.redirect) {
      redirect(data.url);
    }
  };

  const signout = async () => {
    'use server';
    await auth.api.signOut({
      headers: await headers()
    });
    redirect('/');
  };

  const session = await auth.api.getSession({
    headers: await headers()
  });

  const dbValue = (await db.query('SELECT 1 as value')).rows[0].value; // Ensure DB is initialized
  return (
    <Flex direction="column" gap="2">
      <Text>Hello World [{dbValue}]</Text>
      {!session ? (
        <form action={signin}>
          <button type="submit">Sign In with Pretix</button>
        </form>
      ) : (
        <form action={signout}>
          <Flex direction="column" gap="2">
            <Text>Welcome, {session.user?.email}</Text>
            <button type="submit">Sign out</button>
          </Flex>
        </form>
      )}
    </Flex>
  );
}
