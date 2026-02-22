import { Button, Flex, Text } from '@radix-ui/themes';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { currentUser } from '@/session';
import { getEvents } from '@/service/event-service';
import styles from './styles.module.css';

export default async function SettingsPage() {
  const signout = async () => {
    'use server';
    await auth.api.signOut({
      headers: await headers()
    });
    redirect('/');
  };

  const user = await currentUser();

  const eventIds =
    user?.roles
      .filter(
        (r): r is { type: 'organiser'; eventId: string } | { type: 'team-lead'; eventId: string; teamId: string } =>
          r.type === 'organiser' || r.type === 'team-lead'
      )
      .map((r) => r.eventId) ?? [];
  const uniqueEventIds = [...new Set(eventIds)];
  const allEvents = await getEvents();
  const eventsById = Object.fromEntries(
    allEvents.filter((e) => uniqueEventIds.includes(e.id)).map((e) => [e.id, e.name])
  );

  return (
    <Flex direction="column" gap="2">
      <Flex direction="column" gap="2">
        <Text>Settings</Text>
        {user && (
          <>
            <Text>{user.name}</Text>
            <Text size="1" color="gray">
              {user.email}
            </Text>
          </>
        )}
        <Text>Your roles:</Text>
        {(user?.roles.length ?? 0) === 0 && <Text>- No roles assigned</Text>}
        {user?.roles.map((role, index) => (
          <Text key={index}>
            -{' '}
            {role.type === 'admin'
              ? 'Admin'
              : role.type === 'organiser'
                ? `Organiser for ${eventsById[role.eventId] ?? role.eventId}`
                : role.type === 'team-lead'
                  ? `Team Lead for team ${role.teamId} in ${eventsById[role.eventId] ?? role.eventId}`
                  : 'Volunteer'}
          </Text>
        ))}
        <form className={styles.signoutForm} action={signout}>
          <Button className={styles.signoutButton} type="submit">Sign out</Button>
        </form>
      </Flex>
    </Flex>
  );
}
