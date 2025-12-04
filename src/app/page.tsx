/**
 * Temporary test page.
 * Will be removed/replaced later with a better splash page.
 * @since 2025-09-02
 * @author Michael Townsend <@continuities>
 */

import { Flex, Text } from '@radix-ui/themes';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { currentUser } from '@/session';

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

  const user = await currentUser();

  return (
    <Flex direction="column" gap="2">
      {!user ? (
        <form action={signin}>
          <button type="submit">Sign In with Pretix</button>
        </form>
      ) : (
        <form action={signout}>
          <Flex direction="column" gap="2">
            <Text>Welcome, {user.email}</Text>
            <Text>Your roles:</Text>
            {user.roles.length === 0 && <Text>- No roles assigned</Text>}
            {user.roles.map((role: UserRole, index: number) => (
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
