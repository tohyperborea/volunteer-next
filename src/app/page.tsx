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
import { getUserRoles } from '@/service/user-service';

export default async function MyApp() {
  const signin = async () => {
    'use server';
    const data = await auth.api.signInWithOAuth2({
      body: {
        providerId: process.env.OAUTH_PROVIDER_ID ?? '',
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

  const userRoles = session?.user ? await getUserRoles(session.user.id) : [];

  return (
    <Flex direction="column" gap="2">
      {!session ? (
        <form action={signin}>
          <button type="submit">Sign In with Pretix</button>
        </form>
      ) : (
        <form action={signout}>
          <Flex direction="column" gap="2">
            <Text>Welcome, {session.user?.email}</Text>
            <Text>Your roles:</Text>
            {userRoles.length === 0 && <Text>- No roles assigned</Text>}
            {userRoles.map((role, index) => (
              <Text key={index}>
                -{' '}
                {role.type === 'admin'
                  ? 'Admin'
                  : role.type === 'organiser'
                    ? `Organiser for event ${role.eventId}`
                    : `Team Lead for team ${role.teamId} in event ${role.eventId}`}
              </Text>
            ))}
            <button type="submit">Sign out</button>
          </Flex>
        </form>
      )}
    </Flex>
  );
}
