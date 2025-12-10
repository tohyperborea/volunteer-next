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
      <Flex direction="column" gap="2">
        <Text>Welcome, {user?.email}</Text>
        <Text>Your roles:</Text>
        {(user?.roles.length ?? 0) === 0 && <Text>- No roles assigned</Text>}
        {user?.roles.map((role, index) => (
          <Text key={index}>
            -{' '}
            {role.type === 'admin'
              ? 'Admin'
              : role.type === 'organiser'
                ? `Organiser for event ${role.eventId}`
                : `Team Lead for team ${role.teamId} in event ${role.eventId}`}
          </Text>
        ))}
        <form action={signout}>
          <button type="submit">Sign out</button>
        </form>
      </Flex>
    </Flex>
  );
}
